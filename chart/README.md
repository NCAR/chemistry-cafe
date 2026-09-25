# Chemistry Cafe Helm Chart

A Helm chart for deploying Chemistry Cafe to Kubernetes.

## Prerequisites

- Kubernetes 1.24+
- Helm 3.8+
- The External Secrets Operator, with a `SecretStore` that can read from OpenBao

## Secrets

The chart does not take passwords or OAuth credentials as values. The
`ExternalSecret` resources read them from OpenBao at
`kv/<externalSecrets.baoUser>/chemistry-cafe-<instanceName>`. The secret must
have these keys:

- `MYSQL_ROOT_PASSWORD`
- `MYSQL_PASSWORD`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `ORCID_CLIENT_ID`
- `ORCID_CLIENT_SECRET`

## Installation

Run these commands from the repository root.

```bash
helm install chemistry-cafe ./chart -f ./chart/values-dev.yaml
```

For a different instance, copy `values-dev.yaml` and change `instanceName`,
the ingress host, `backend.frontendHost`, and `externalSecrets`.

## Automatic dev deployment

Each push to `main` runs `.github/workflows/docker_image.yml`. The workflow
builds the backend and frontend images and tags them with the short commit SHA.
Then it writes that SHA into `imageTag` in `values-dev.yaml` and pushes the
change to `main`.

## Configuration

### Required Values

| Parameter | Description |
|-----------|-------------|
| `externalSecrets.secretStoreName` | The `SecretStore` that reads from OpenBao |
| `externalSecrets.baoUser` | The OpenBao path segment that holds the secret |
| `backend.frontendHost` | Frontend URL for CORS/OAuth redirects |

### Common Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `replicaCount` | Number of pod replicas | `1` |
| `instanceName` | Name of the instance, used in the OpenBao secret path | `dev` |
| `imageRegistry` | Container image registry | `docker.io` |
| `imageRepository` | Image repository prefix; the chart adds `-backend` and `-frontend` | `ncar/chemistry-cafe` |
| `imageTag` | Container image tag | `latest` |
| `backend.env.SEED_DATABASE` | `true` adds the default families to an empty database | `""` |
| `ingress.enabled` | Enable ingress | `true` |
| `ingress.className` | Ingress class name | `traefik` |
| `mysql.persistence.enabled` | Enable MySQL persistence | `true` |
| `mysql.persistence.size` | MySQL PVC size | `10Gi` |

The dev values turn off MySQL persistence. The database is empty after each
restart of the MySQL pod, so the dev values set `SEED_DATABASE` to `true`.

### Database schema

MySQL runs `init.sql` when it starts with an empty data directory. Helm can
read only files inside the chart, so `chart/init.sql` is a copy of the
`init.sql` in the repository root. Copy the file again after each schema change.

## Uninstalling

```bash
helm uninstall chemistry-cafe
```

To also delete PVCs:

```bash
helm uninstall chemistry-cafe
kubectl delete pvc data-chem-cafe-mysql-0
```

## Troubleshooting

### Backend not starting

```bash
kubectl logs -l app.kubernetes.io/component=backend
kubectl logs -l app.kubernetes.io/component=database
```

### Frontend not accessible

```bash
kubectl get ingress chem-cafe-ingress
kubectl describe ingress chem-cafe-ingress
```

### Database connection issues

```bash
kubectl get service chem-cafe-mysql
kubectl exec -it chem-cafe-mysql-0 -- mysql -u root -p
```