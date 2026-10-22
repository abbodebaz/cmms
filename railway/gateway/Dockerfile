FROM nginx:1.27-alpine
COPY default.conf.template /etc/nginx/templates/default.conf.template
ENV FRONTEND_HOST=frontend.railway.internal FRONTEND_PORT=3000 API_HOST=api.railway.internal API_PORT=8080 PORT=8080
