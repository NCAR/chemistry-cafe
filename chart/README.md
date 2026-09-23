# Chemistry Cafe Helm Chart

A Helm chart for deploying Chemistry Cafe to Kubernetes.

## Prerequisites

- Kubernetes 1.24+
- Helm 3.8+
- MySQL client for init script execution

## Installation

### Basic Installation

```bash
helm install chemistry-cafe ./chemistry-cafe \
  --set backend.googleClientId=YOUR_GOOGLE_CLIENT_ID \
  --set backend.googleClientSecret=YOUR_GOOGLE_CLIENT_SECRET \
  --set backend.frontendHost=https://your-domain.com \
  --set mysql.rootPassword=YOUR_ROOT_PASSWORD \
  --set mysql.password=YOUR_PASSWORD
```

### Using values.yaml

Create a custom `values.yaml` file with your configuration and run:

```bash
helm install chemistry-cafe ./chemistry-cafe -f values.yaml
```

### Production Installation

Use the provided `values-production.yaml`:

```bash
helm install chemistry-cafe ./chemistry-cafe \
  -f ./chemistry-cafe/values-production.yaml \
  --set backend.googleClientId=YOUR_GOOGLE_CLIENT_ID \
  --set backend.googleClientSecret=YOUR_GOOGLE_CLIENT_SECRET \
  --set backend.frontendHost=https://your-domain.com \
  --set mysql.rootPassword=YOUR_ROOT_PASSWORD \
  --set mysql.password=YOUR_PASSWORD
```

## Configuration

### Required Values

| Parameter | Description |
|-----------|-------------|
| `backend.googleClientId` | Google OAuth client ID |
| `backend.googleClientSecret` | Google OAuth client secret |
| `backend.frontendHost` | Frontend URL for CORS/OAuth redirects |
| `mysql.rootPassword` | MySQL root password |
| `mysql.password` | MySQL application password |

### Common Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `replicaCount` | Number of pod replicas | `1` |
| `imageRegistry` | Container image registry | `docker.io` |
| `imageRepository` | Container image repository | `ncar/chemistry-cafe` |
| `imageTag` | Container image tag | `latest` |
| `ingress.enabled` | Enable ingress | `true` |
| `ingress.className` | Ingress class name | `traefik` |
| `mysql.persistence.enabled` | Enable MySQL persistence | `true` |
| `mysql.persistence.size` | MySQL PVC size | `10Gi` |

## Uninstalling

```bash
helm uninstall chemistry-cafe
```

To also delete PVCs:

```bash
helm uninstall chemistry-cafe
kubectl delete pvc -l app.kubernetes.io/name=chemistry-cafe
```

## Troubleshooting

### Backend not starting

```bash
kubectl logs -l app.kubernetes.io/component=backend
kubectl logs -l app.kubernetes.io/component=database
```

### Frontend not accessible

```bash
kubectl get ingress chemistry-cafe-ingress
kubectl describe ingress chemistry-cafe-ingress
```

### Database connection issues

```bash
kubectl get service chemistry-cafe-mysql
kubectl exec -it chemistry-cafe-mysql-0 -- mysql -u root -p
```