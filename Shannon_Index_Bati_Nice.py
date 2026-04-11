import pandas as pd
import geopandas as gpd
import osmnx as ox
import numpy as np
import psycopg2
from sqlalchemy import create_engine


DB_NAME = "shannon_index_nice_db"
DB_USER = "postgres"
DB_PASS = "postgres"
DB_HOST = "localhost"
DB_PORT = "5432"

engine = create_engine(f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}")

try:
    conn = psycopg2.connect(database=DB_NAME,
                            user=DB_USER,
                            password=DB_PASS,
                            host=DB_HOST,
                            port=DB_PORT)
    print("Connexion réussie à la base de donnée")
except:
    print("Erreur de connexion")


PLACE = "Nice, France"
BUFFER_DIST = 200


admin_nice = ox.geocode_to_gdf(PLACE)
bati_06 = gpd.read_file("C:/Users/fd-ba/Desktop/PYTHON/0_Indice_Shannon/data/BATIMENT.shp")


def shannon_index(bati_data, boundary, buffer_dist):
	bati = bati_data.to_crs(2154)
	boundary = boundary.to_crs(2154)

	bati_in_boundary = bati.sjoin(boundary, how='inner', predicate='intersects')
	bati_in_boundary = bati_in_boundary[['ID', 'USAGE1', 'geometry']].copy()

	bati_in_boundary['buffer_geom'] = bati_in_boundary['geometry'].buffer(buffer_dist)
	bati_in_boundary_buffer = bati_in_boundary[['ID', 'buffer_geom']].copy()
	bati_in_boundary_buffer = bati_in_boundary_buffer.rename(columns={'buffer_geom': 'geometry'}).set_geometry('geometry')
	bati_in_boundary_buffer['buffer_id'] = bati_in_boundary_buffer.index 

	buffer_sjoin_bati = gpd.sjoin(bati_in_boundary_buffer, bati_in_boundary[['ID', 'USAGE1', 'geometry']], how='left', predicate='intersects')
	buffer_sjoin_bati = buffer_sjoin_bati.rename(columns={'ID_right': 'ID_Bati', 'index_right': 'index_Bati', 'ID_left': 'ID_Buffer'})

	usage_counts = buffer_sjoin_bati.groupby(['ID_Buffer','USAGE1']).agg({'ID_Bati':'count'}).reset_index().rename(columns={'ID_Bati' :'Nb_bati'})

	sum_bati_for_each_buffer = usage_counts.groupby('ID_Buffer')['Nb_bati'].sum().rename('total_bati')
	usage_counts_with_total = usage_counts.merge(sum_bati_for_each_buffer, on='ID_Buffer')
	usage_counts_with_total['proportion'] = usage_counts_with_total['Nb_bati'] / usage_counts_with_total['total_bati']
	usage_counts_with_total['ln_proportion'] = usage_counts_with_total['proportion'] * np.log(usage_counts_with_total['proportion'])
	usage_counts_with_total['ln_proportion'] = usage_counts_with_total['ln_proportion'].fillna(0)

	shannon_df = usage_counts_with_total.groupby('ID_Buffer')['ln_proportion'].sum().reset_index()
	shannon_df = shannon_df.rename(columns={'ID_Buffer': 'ID', 'ln_proportion': 'shannon_index'})
	shannon_df['shannon_index'] = shannon_df['shannon_index'] * -1

	bati_with_shannon = bati_in_boundary.merge(shannon_df, on='ID', how='left')
	bati_with_shannon['shannon_index'] = bati_with_shannon['shannon_index'].fillna(0)
	bati_with_shannon = bati_with_shannon[['ID', 'USAGE1', 'shannon_index', 'geometry']].set_geometry('geometry')

	return bati_with_shannon


shannon_index = shannon_index(bati_06, admin_nice, BUFFER_DIST)

shannon_index.to_postgis("shannon_idx_bati_nice", engine)