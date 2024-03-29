apiVersion: v1
kind: Service
metadata:
  name: api
  namespace: can-i-test
spec:
  selector:
    app: api
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-deployment
  namespace: can-i-test
  labels:
    app: api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
        - name: api
          image: rodrigomartinezd/can-i-test-api:{{ .Values.dockerImageTag }}
          ports:
            - containerPort: 3000
          env:
          {{- include "helpers.list-env-variables" . | indent 10 }}
            - name: GITHUB_OAUTH_CLIENT_ID
              valueFrom:
                secretKeyRef:
                  key: clientId
                  name: {{ .Release.Name }}-github-oauth
            - name: GITHUB_OAUTH_CLIENT_SECRET
              valueFrom:
                secretKeyRef:
                  key: clientSecret
                  name: {{ .Release.Name }}-github-oauth
            - name: JWT_SECRET
              valueFrom:
                secretKeyRef:
                  key: jwtSecret
                  name: {{ .Release.Name }}-jwt
          imagePullPolicy: Always
