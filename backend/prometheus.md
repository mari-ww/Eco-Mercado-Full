## Acesse o Grafana:
http://localhost:4000

## login no Grafana
```bash
Usuário: admin
Senha: admin ou 123456
```

##  Configure a Fonte de Dados (Prometheus)
```bash
1 - No menu lateral: Configuration > Data Sources
2 - Clique em Add data source
3 - Selecione Prometheus
4 - Preencha:
URL: http://prometheus:9090
authentication: escolhe basic authentication e preenche: user@teste.com e senha123
```

## Monitoramento por metricas
na barra na esquerda vai ter *"Drilldown"* e dentro vai ter *"metrics"*, clique em metrics

## Criar Dashboards
No Grafana, você poderá criar dashboards usando métricas como:
```bash
http_request_duration_ms_bucket
auth_login_attempts_total
cart_operations_total
order_status_changes_total
product_requests_total
payment_operations_total
```