FROM nginx:1.13.12-alpine as base

# nginx configuration
COPY ./nginx.conf /etc/nginx/nginx.conf

# move build folder to nginx
COPY ./build /usr/share/nginx/html

# expose the product on port 80
EXPOSE 80

FROM base as staging
CMD ["nginx", "-g", "daemon off;"]

FROM base as production

CMD ["nginx", "-g", "daemon off;"]