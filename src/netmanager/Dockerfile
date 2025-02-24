FROM nginx:1.13.12-alpine as base

# nginx configuration
COPY ./nginx.conf /etc/nginx/nginx.conf

# move build folder to nginx
COPY ./build /usr/share/nginx/html

# expose the product on port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]