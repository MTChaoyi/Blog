---
title: Ubuntu服务器之Docker
tags:
  - Ubuntu
  - 服务器
  - Docker
categories:
  - 一点小教程
description: Ubuntu服务器配置Docker环境
date: 2023-02-03 01:30:37
updated: 2024-05-07 17:07:12
aging: true
aging_days: 60
---

# 安装 Docker 环境

**一键脚本（推荐）** `curl -fsSL https://get.docker.com | bash -s docker`

<details> <summary>手动安装（不推荐）</summary>

- 更新软件包索引，并且安装必要的依赖软件，来添加一个新的 HTTPS 软件源
  ```
  sudo apt update
  sudo apt install apt-transport-https ca-certificates curl gnupg-agent software-properties-common
  ```
- 使用下面的 curl 导入源仓库的 GPG key：
  ```
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
  ```
- 将 Docker APT 软件源添加到你的系统：
  ```
  sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
  ```
- 现在，Docker 软件源被启用了，你可以安装软件源中任何可用的 Docker 版本。

- 想要安装 Docker 最新版本，运行下面的命令。
  ```
  sudo apt update
  sudo apt install docker-ce docker-ce-cli containerd.io
  ```
- 运行`sudo apt update`可能会有`Warning`
  解决方法参考[ubuntu 22.04 修复 key is stored in legacy trusted.gpg keyring](https://blog.csdn.net/jiang_huixin/article/details/127186567)
- 以非 Root 用户身份执行 Docker
  ```
  sudo usermod -aG docker $USER
  ```
  </details>

# Docker 防火墙管理

# 常用 Docker 操作

## Docker 命令行操作

- 查看所有正在运行的容器

  ```
  docker ps -a
  ```

- 进入 Docker 容器
  ```
  docker exec -it [docker_id] /bash
  docker exec -it [docker_id] /bin/sh
  ```

## 镜像导入/导出

- 查看宿主机所有镜像

  ```
  docker images
  ```

- 使用`save`命令，通过镜像 id 导出镜像到宿主机当前文件夹下

  ```
  docker save -o qinglong.tar whyour/qinglong:latest
  ```

- 执行以下命令进行镜像导入
  ```
  docker load < qinglong.tar
  ```

## 更改镜像储存位置

- 默认情况下 Docker 容器的存放位置在`/var/lib/docker`目录下面
- 可以通过下面命令查看具体位置
  ```
  sudo docker info | grep "Docker Root Dir"
  ```
- 解决默认存储容量不足的情况，最直接且最有效的方法就是挂载新的分区到该目录。但是在原有系统空间不变的情况下，所以采用软链接的方式，修改镜像和容器的存放路径达到同样的目的。

  ```
  # 停掉Docker服务
  $ systemctl restart docker

  # 停掉Docker服务
  $ service docker stop
  ```

- 然后移动整个`/var/lib/docker`目录到空间不较大的目的路径。这时候启动 `Docker` 时发现存储目录依旧是 `/var/lib/docker` 目录，但是实际上是存储在数据盘 `/data/docker` 上了

  ```
  # 移动原有的内容
  $ mv /var/lib/docker /data/docker

  # 进行链接
  $ ln -sf /data/docker /var/lib/docker
  ```

# 自用推荐 Docker 应用

## alist

> 项目地址：[alist-org/alist](https://github.com/alist-org/alist)

> 项目简介：一个支持多存储的文件列表/WebDAV 程序，使用 Gin 和 Solidjs。

```yaml
version: "3.3"
services:
  alist:
    restart: always
    volumes:
      - "/root/Docker/alist:/opt/alist/data"
    ports:
      - "5244:5244"
    environment:
      - PUID=0
      - PGID=0
      - UMASK=022
    container_name: alist
    image: "xhofe/alist:latest"
```

## Nezha 面板

> 项目地址：[nezhahq/nezhahq.github.io](https://github.com/nezhahq/nezhahq.github.io)

> 项目简介：开源、轻量、易用的服务器监控、运维工具

```yaml
version: "3.3"

services:
  dashboard:
    image: ghcr.io/naiba/nezha-dashboard:latest
    restart: always
    volumes:
      - /root/Docker/Nezha/data:/dashboard/data
      - /root/Docker/Nezha/static-custom/static:/dashboard/resource/static/custom:ro
      - /root/Docker/Nezha/theme-custom/template:/dashboard/resource/template/theme-custom:ro
      - /root/Docker/Nezha/dashboard-custom/template:/dashboard/resource/template/dashboard-custom:ro
    ports:
      - 5558:5558
      - 5559:5559
```

## Picsur

> 项目地址：[CaramelFur/Picsur](https://github.com/CaramelFur/Picsur)

> 项目简介：一个易于使用、可自托管的图像共享服务，类似 Imgur，具有内置转换功能

```yaml
version: "3"
services:
  picsur:
    image: ghcr.io/caramelfur/picsur:latest
    container_name: picsur
    ports:
      - "8003:8080" #8003可以改成服务器上没有用过的端口
    environment:
      PICSUR_HOST: "0.0.0.0"
      PICSUR_PORT: 8080
      PICSUR_DB_HOST: picsur_postgres
      PICSUR_DB_PORT: 5432
      PICSUR_DB_USERNAME: picsur
      PICSUR_DB_PASSWORD: nice-long-strong-passw0rd-here # 确保和picsur_postgres:部分的 POSTGRES_PASSWORD 匹配
      PICSUR_DB_DATABASE: picsur

      ## 默认管理员账户是 admin, 这个没法改，密码就是下面这个你设置的
      PICSUR_ADMIN_PASSWORD: your_password

      ## 可选的，如果没有设置会默认生产随机字符
      # PICSUR_JWT_SECRET: CHANGE_ME
      # PICSUR_JWT_EXPIRY: 7d

      ## 最大可以上传的字节数
      PICSUR_MAX_FILE_SIZE: 128000000 # 128 MB
      ## No need to touch this, unless you use a custom frontend
      # PICSUR_STATIC_FRONTEND_ROOT: "/picsur/frontend/dist"

      ## Warning: Verbose mode might log sensitive data
      # PICSUR_VERBOSE: "true"
    restart: unless-stopped

  picsur_postgres:
    image: postgres:14-alpine
    container_name: picsur_postgres
    environment:
      POSTGRES_DB: picsur
      POSTGRES_PASSWORD: nice-long-strong-passw0rd-here
      POSTGRES_USER: picsur
    restart: unless-stopped
    volumes:
      - /root/Docker/Picsur/picsur-data:/var/lib/postgresql/data # 默认数据存放在当前文件夹下的picsur-data目录中，可以自行修改
```

## Portainer-ce

> 项目地址：[6053537/portainer-ce](https://hub.docker.com/r/6053537/portainer-ce)

> 项目简介：一个轻量级的 docker 环境管理 UI

```yaml
version: "2"
services:
  portainer:
    image: 6053537/portainer-ce:latest
    container_name: portainer
    restart: always
    ports:
      - "9000:9000"
    volumes:
      - /root/Docker:/root/Docker
      - /root/Docker/dockerconfig/portainer:/data
      - /var/run/docker.sock:/var/run/docker.sock
volumes:
  data:
```

## qinglong

> 项目地址：[whyour/qinglong](https://github.com/whyour/qinglong)

> 项目简介：支持 Python3、JavaScript、Shell、Typescript 的定时任务管理平台

```yaml
version: "2"
services:
  web:
    # alpine 基础镜像版本
    image: whyour/qinglong:latest
    # debian-slim 基础镜像版本
    # image: whyour/qinglong:debian
    volumes:
      - /root/Docker/qinglong/data:/ql/data
    ports:
      - "5700:5700"
    environment:
      # 部署路径非必须，以斜杠开头和结尾，比如 /test/
      QlBaseUrl: "/"
    restart: unless-stopped
```

## TTRSS

> 项目地址：[HenryQW/Awesome-TTRSS](https://github.com/HenryQW/Awesome-TTRSS)

> 项目简介：一款基于 PHP 的免费开源 RSS 聚合阅读器

```yaml
version: "3"
services:
  service.rss:
    image: wangqiru/ttrss:latest
    container_name: ttrss
    ports:
      - "3894:80"
    environment:
      - SELF_URL_PATH=https://your.domin.com/ # 按需修改
      - DB_PASS=your_password # 按需修改。与下面的密码对应
    volumes:
      - /root/Docker/TTRSS/feed-icons:/var/www/feed-icons/
    networks:
      - public_access
      - service_only
      - database_only
    stdin_open: true
    tty: true
    restart: always

  service.mercury:
    image: wangqiru/mercury-parser-api:latest
    container_name: mercury
    networks:
      - public_access
      - service_only
    restart: always

  service.opencc:
    image: wangqiru/opencc-api-server:latest
    container_name: opencc
    environment:
      - NODE_ENV=production
    networks:
      - service_only
    restart: always

  database.postgres:
    image: postgres:13-alpine
    container_name: postgres
    environment:
      - POSTGRES_PASSWORD=your_password # 按需修改。与上面的密码对应
    volumes:
      - /root/Docker/TTRSS/db/:/var/lib/postgresql/data
    networks:
      - database_only
    restart: always

networks:
  public_access:
  service_only:
    internal: true
  database_only:
    internal: true
```

## vaultwarden

> 项目地址：[dani-garcia/vaultwarden](https://github.com/dani-garcia/vaultwarden)

> 项目简介：一个使用 Rust 编写的非官方 Bitwarden 密码管理器服务器实现

```yaml
version: "3"
services:
  vaultwarden:
    image: vaultwarden/server:latest
    container_name: vaultwarden
    restart: always
    ports:
      - 3011:80
    environment:
      - PUSH_ENABLED=true
      - PUSH_INSTALLATION_ID=6e53f383-55e6-4f7b-9252-b0fd00a6194f
      - PUSH_INSTALLATION_KEY=yxv2lyRsRY7vQpq9Rmzf
    volumes:
      - /root/Docker/vaultwarden/data/:/data/
```

## Yourls

> 项目地址：[YOURLS/YOURLS](https://github.com/YOURLS/YOURLS)

> 项目简介：基于 PHP 的一个可以让你在自己的服务器上运行的 URL 缩短服务

```yaml
version: "3.5"
services:
  mysql:
    image: mariadb:jammy #mysql:5.7
    environment:
      - MYSQL_ROOT_PASSWORD=my-secret-pw
      - MYSQL_DATABASE=yourls
      - MYSQL_USER=yourls
      - MYSQL_PASSWORD=yourls
    volumes:
      #- ./mysql20231229/db/:/var/lib/mysql
      #- ./mysql20231229/conf/:/etc/mysql/conf
      - /root/Docker/yourls/yMariaDb:/var/lib/mysql
      #- ./OLDmysql_20231120/db/:/var/lib/mysql
    restart: always
    container_name: yourls_mysql

  yourls:
    image: yourls
    restart: always
    ports:
      - "8200:80"
    environment:
      YOURLS_DB_HOST: mysql
      YOURLS_DB_USER: yourls
      YOURLS_DB_PASS: yourls
      YOURLS_DB_NAME: yourls
      YOURLS_USER: your_username
      YOURLS_PASS: your_password
      YOURLS_SITE: https://your.domain.com
      YOURLS_HOURS_OFFSET: 8
    volumes:
      - /root/Docker/yourls/yourls_data/:/var/www/html
    container_name: yourls_service
    links:
      - mysql:mysql
```
