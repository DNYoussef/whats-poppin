FROM nginx:1.29-alpine@sha256:5616878291a2eed594aee8db4dade5878cf7edcb475e59193904b198d9b830de
ENV NGINX_ENTRYPOINT_LOCAL_RESOLVERS=1
ENV NGINX_ENVSUBST_FILTER="^(SB_AUTH_HOST|SB_REST_HOST|ANON_KEY|SERVICE_ROLE_KEY|NGINX_LOCAL_RESOLVERS)$"
ENV PORT=8080
COPY default.conf.template /etc/nginx/templates/default.conf.template
COPY --chmod=755 10-required-env.sh /docker-entrypoint.d/10-required-env.sh
