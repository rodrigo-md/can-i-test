apiVersion: v1
kind: Secret
metadata:
    name: {{ .Release.Name }}-github-oauth
    namespace: "can-i-test"
data:
    clientId: {{ .Values.githubClientId | b64enc }}
    clientSecret: {{ .Values.githubClientSecret | b64enc }}