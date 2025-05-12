# AcquaScope: Maritime Traffic Analysis

Real-time distributed platform for analyzing maritime traffic data from multiple sources, developed by Emiliano Sescu and Giovanni Bellini.

Project for the Scalable and Distributed Computing Course - Final Grade: 30L/30

## Problem Context
Maritime traffic monitoring is crucial for navigation safety, port management, and operational efficiency. The Automatic Identification System (AIS), placed in every vessel, provides vital data on vessel position, speed, and route. However, [AIS](https://shipping.nato.int/nsc/operations/news/2021/ais-automatic-identification-system-overview) data is often scattered across:
- **AIS antennas** and **VTS stations** for coverage in coastal areas.
- **Satellite-based systems** (e.g., INMARSAT) for remote or open ocean regions or for ensuring redundancy.

Click [here](#map-example) to have a look at a real map containing those elements.

This project aims to build a scalable platform to ingest, process, and analyze these data streams, enhancing anomaly detection and decision-making capabilities for maritime operators.

## Platform Architecture
The platform ensures scalability, fault tolerance, and low latency using modern distributed technologies.

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://github.com/user-attachments/assets/cdbc876f-e4ee-4c57-89d0-997452b56f3c">
    <source media="(prefers-color-scheme: light)" srcset="https://github.com/user-attachments/assets/31cb294a-5b6b-448a-991a-b4e722f284dc">
    <img alt="drawing" src="https://github.com/user-attachments/assets/63132fbd-c776-4498-9e00-a5b607cf3860" width="700">
  </picture>
</p>

## Objectives
1. **Ingest data**: Data streams from AIS antennas, VTS stations, and satellite providers are fetched via provider APIs (for testing purposes logs are generated) ingested into Kafka clusters. Kafka acts as a durable buffer, ensuring reliable data delivery to downstream systems.

2. **Process data streams**: Flink Structured Streaming processes data from Kafka in real-time. This includes:
    - Identify and track unregistered vessels in Cassandra.
    - Generate alarms when a vessel stops providing logs before reaching its destination, or when it deviates from its expected route beyond a defined threshold. All alarms are stored in Cassandra.
  
3. **Stores data streams**: Logs are stored in Apache Druid in daily segments for fast querying.

5. **Visualize results**: The Operator UI provides a dynamic map that updates in real time to track vessel movements, along with dedicated pages for alarms and vessel details. Grafana enables monitoring of Kubernetes cluster performance.

## Technology Stack
| Component                  | Technology                                                 |
| -------------------------- | ---------------------------------------------------------- |
| **Ingestion**              | Apache Kafka                                               |
| **Stream Processing**      | Apache Flink                                               |
| **Real-time Storage**      | Apache Druid (logs), Cassandra (alarms & vessel info)      |
| **Block Storage**          | Longhorn (Kafka persistence, Druid metadata in PostgreSQL) |
| **Object Storage**         | MinIO (Druid segments, Flink checkpoints)                  |
| **Orchestration**          | Kubernetes (K8s)                                           |
| **Kafka Management**       | Strimzi (Kubernetes Operator with [Cruise Control](https://github.com/linkedin/cruise-control)|
| **Ingress Controller**     | Traefik                                                    |
| **Continuous Deployment**  | ArgoCD                                                     |
| **Infrastructure as Code** | Ansible (with Kubespray)                                   |
| **Monitoring**             | Grafana (Cluster state and performance)                    

## Deployment & Testing in UniPi Cluster

The platform was deployed and tested on a **UniPi cluster** consisting of four machines:

- **1 control plane node** running only Kubernetes.
- **3 worker nodes** hosting the distributed application components.

Services were distributed across multiple nodes to ensure fault tolerance. If a node failed, workloads were automatically rescheduled onto healthy nodes. For better understanding of how fault tolerance was achieved through distribution, please refer to the documentation.

### Orchestration & Deployment

- Kubernetes managed the orchestration of Flink, Kafka, and Druid, ensuring scalability and high availability.
- ArgoCD handled continuous deployment, automating application updates.
- Traefik was used as the ingress controller for managing external traffic.
- Ansible with Kubespray automated Kubernetes cluster provisioning and infrastructure setup.

## Future Work
1. **Advanced Anomaly Detection:**
   - Explore frameworks for applying machine learning to detect anomalies in vessel trajectories.
   - Integrate methodologies for detecting deviations from expected routes, clustering unusual patterns, etc.

2. **Multi-Region Support:**
   - Optimize for global deployments with data replication and geo-distributed processing.

## Map Example

<p align="center">
<img src="https://github.com/user-attachments/assets/ebbbdadd-de90-48a8-b26e-724738ddadc2" alt="drawing" width="700"/>
</p>

## Acknowledgments

This map example is taken from a [National Systems of Safety and Protection of Navigation](https://www.researchgate.net/publication/228454684_National_Systems_of_Safety_and_Protection_of_Navigation_Narodowy_System_Bezpieczenstwa_i_Ochrony_Zeglugi) paper.

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.


