apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-ingress
  namespace: can-i-test
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
    - hosts:
        - {{ .Values.domain }}
      secretName: letsencrypt-prod
  rules:
    - host: {{ .Values.domain }}
      http:
        paths:
          - pathType: Prefix
            path: "/"
            backend:
              service: 
                name: api
                port: 
                  number: 80
