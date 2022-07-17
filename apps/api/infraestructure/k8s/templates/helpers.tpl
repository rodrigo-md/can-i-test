{{- define "helpers.list-env-variables"}}
{{- range $key, $val := .Values.env }} 
  - name: {{ $key }}
    value: {{ $val | quote }}
{{- end}}
{{- end }}