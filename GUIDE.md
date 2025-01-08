# How to run the Kubernetes application
To run the Kubernetes application, make sure you have the following tools installed:
- [Minikube](https://minikube.sigs.k8s.io/docs/start/)
- [Kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- [Helm](https://helm.sh/docs/intro/install/)
- [Docker](https://docs.docker.com/get-docker/) (or equivalent container runtime)

1. First, start Minikube by running:

```bash
minikube start
```

2. Next, deploy the application using Helm:

```bash
helm install -n operator-ui operator-ui --values operator-ui/values.yaml ./operator-ui
helm install --create-namespace -n kafka kafka --values kafka/values.yaml bitnami/kafka
helm install --create-namespace -n druid druid --values druid/values.yaml bitnami/druid
```

3. Then, create the data simulator pods by running:

```bash
helm install --create-namespace -n ais-data-simulator-satellite ais-data-simulator-satellite --values ais-data-simulator-satellite/values.yaml ./ais-data-simulator
helm install --create-namespace -n ais-data-simulator-vts ais-data-simulator-vts --values ais-data-simulator-vts/values.yaml ./ais-data-simulator
```


3. To access the Operator UI, run:

```bash
minikube service operator-ui -n operator-ui
```