{{- define "chemistry-cafe.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "chemistry-cafe.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{- define "chemistry-cafe.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "chemistry-cafe.labels" -}}
helm.sh/chart: {{ include "chemistry-cafe.chart" . }}
{{ include "chemistry-cafe.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "chemistry-cafe.selectorLabels" -}}
app.kubernetes.io/name: {{ include "chemistry-cafe.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{- define "chemistry-cafe.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "chemistry-cafe.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{- define "chemistry-cafe.mysql.serviceName" -}}
{{- printf "%s-mysql" (include "chemistry-cafe.fullname" .) }}
{{- end }}

{{- define "chemistry-cafe.backend.serviceName" -}}
{{- printf "%s-backend" (include "chemistry-cafe.fullname" .) }}
{{- end }}

{{- define "chemistry-cafe.frontend.serviceName" -}}
{{- printf "%s-frontend" (include "chemistry-cafe.fullname" .) }}
{{- end }}

{{- define "chemistry-cafe.ingress.name" -}}
{{- printf "%s-ingress" (include "chemistry-cafe.fullname" .) }}
{{- end }}

{{- define "chemistry-cafe.mysql.secretName" -}}
{{- printf "%s-mysql" (include "chemistry-cafe.fullname" .) }}
{{- end }}

{{- define "chemistry-cafe.backend.secretName" -}}
{{- printf "%s-backend" (include "chemistry-cafe.fullname" .) }}
{{- end }}