# AcquaScope: Maritime Traffic Analysis

Real-time distributed platform for analyzing maritime traffic data from multiple sources, developed by Emiliano Sescu and Giovanni Bellini.

Project for the Scalable and Distributed Computing Course - Final Grade: x/30

## Problem Context
Maritime traffic monitoring is crucial for navigation safety, port management, and operational efficiency. The Automatic Identification System (AIS), placed in every vessel, provides vital data on vessel position, speed, and route. However, [AIS](https://shipping.nato.int/nsc/operations/news/2021/ais-automatic-identification-system-overview) data is often scattered across:
- **AIS antennas** and **VTS stations** for coverage in coastal areas.
- **Satellite-based systems** (e.g., INMARSAT) for remote or open ocean regions or for ensuring redundancy.

Click [here](#map-example) to have a look at a real map containing those elements.

This project aims to build a scalable platform to ingest, process, and analyze these diverse data streams, enhancing anomaly detection and decision-making capabilities for maritime operators.

## Platform Architecture
The platform is designed around modern, distributed technologies to ensure scalability, fault tolerance, and low latency. 

<p align="center">
<img src="https://github.com/user-attachments/assets/00af7707-aa20-4a73-9a54-c52b369c8900" alt="drawing" width="700"/>
</p>

## Objectives
1. **Ingest data**: Data streams from AIS antennas, VTS stations, and satellite providers are ingested into Kafka clusters. Kafka acts as a durable buffer, ensuring reliable data delivery to downstream systems.

2. **Process data streams** Spark Structured Streaming processes data from Kafka in real-time. This includes:
  - Aggregations and metrics calculations.
  - Window-based analysis for trends.
  - Anomaly detection based on deviations, patterns, and thresholds.
  - Enrichment with metadata (e.g., vessel type, distance from the coast).
  
3. **Store enriched data** Processed data is stored in Apache Druid. This enables ultra-fast query performance and supports interactive analytics.

5. **Visualize results** Dashboards will visualize vessel positions, anomalies, and trends on an interactive map. Operators can execute queries and drill down into data for informed decision-making.

## Key Features
- **Multi-Site Data Handling:** Each site processes its local data but also integrates with a central system for global insights.
- **Real-Time Processing:** Immediate processing of sensor data for low-latency analytics.
- **Anomaly Detection:** Potential to integrate machine learning algorithms for detecting anomalies in vessel movements based on geospatial and temporal data.
- **Scalability:** Kubernetes orchestration ensures fault tolerance and dynamic scaling based on workload.

## Technology Stack
| Component              | Technology                                                                 |
|------------------------|---------------------------------------------------------------------------|
| **Ingestion**         | Apache Kafka                                                             |
| **Stream Processing** | Apache Spark                                                             |
| **Storage**           | Apache Druid                                                            |
| **Orchestration**     | Kubernetes (K8s)                                                        |
| **Infrastructure**    | Terraform for Infrastructure as Code (IaC)                              |
| **Visualization**     | Custom UI (to be developed) or integration with existing frameworks      |

## Deployment and Scalability
- **Kubernetes (K8s):**
  - Orchestrates Spark, Kafka, and Druid clusters.
  - Provides fault tolerance through pod rescheduling and scaling.
  - Enables auto-scaling based on system load.

- **Terraform:**
  - Simplifies provisioning and management of cloud resources.
  - Ensures consistency across development, staging, and production environments.

## Future Work
1. **Advanced Anomaly Detection:**
   - Explore frameworks for applying machine learning to detect anomalies in vessel trajectories.
   - Integrate methodologies for detecting deviations from expected routes, clustering unusual patterns, etc.

2. **Enhanced Visualization:**
   - Develop a user-friendly map-based UI for real-time monitoring and querying.
   - Explore frameworks for geospatial data visualization (e.g., Mapbox, Leaflet).

3. **Multi-Region Support:**
   - Optimize for global deployments with data replication and geo-distributed processing.

## Map Example

<p align="center">
<img src="https://github.com/user-attachments/assets/ebbbdadd-de90-48a8-b26e-724738ddadc2" alt="drawing" width="700"/>
</p>

## Acknowledgments

This map example is taken from a [National Systems of Safety and Protection of Navigation](https://www.researchgate.net/publication/228454684_National_Systems_of_Safety_and_Protection_of_Navigation_Narodowy_System_Bezpieczenstwa_i_Ochrony_Zeglugi) paper.

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.


