apiVersion: v1
kind: Secret
metadata:
    name: {{ .Release.Name }}-jwt
    namespace: "can-i-test"
data:
    jwtSecret: {{ .Values.jwtSecret | b64enc }}