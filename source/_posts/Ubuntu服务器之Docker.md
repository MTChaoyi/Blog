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
updated: 2024-10-25 11:21:52
aging: true
aging_days: 60
---

# 安装 Docker 环境

**一键脚本（仅个人使用推荐）** `curl -fsSL https://get.docker.com | bash -s docker`

<details> <summary>手动安装（生产环境推荐）</summary>

- 更新软件包索引，并且安装必要的依赖软件，来添加一个新的 HTTPS 软件源
  ```bash
  sudo apt update
  sudo apt install apt-transport-https ca-certificates curl gnupg-agent software-properties-common
  ```
- 使用下面的 curl 导入源仓库的 GPG key：
  ```bash
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
  ```
- 将 Docker APT 软件源添加到你的系统：
  ```bash
  sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
  ```
- 现在，Docker 软件源被启用了，你可以安装软件源中任何可用的 Docker 版本。

- 想要安装 Docker 最新版本，运行下面的命令。
  ```bash
  sudo apt update
  sudo apt install docker-ce docker-ce-cli containerd.io
  ```
- 运行`sudo apt update`可能会有`Warning`
  解决方法参考[ubuntu 22.04 修复 key is stored in legacy trusted.gpg keyring](https://blog.csdn.net/jiang_huixin/article/details/127186567)
- 以非 Root 用户身份执行 Docker
  ```bash
  sudo usermod -aG docker $USER
  ```
  </details>

# Docker 操作

## 容器相关

### 查看信息

- 查看已部署的容器

  ```bash
  docker ps  # 仅显示正常运行的容器
  docker ps -a  # 所有容器
  ```

- 查看容器日志

  ```bash
  docker logs [CONTAINER]
  ```

- 查看容器占用状态

  ```bash
  docker stats
  docker stats --no-stream  # 仅输出当前状态
  ```

### 容器操作

- 进入 Docker 容器
  ```bash
  docker exec -it [CONTAINER] /bash
  docker exec -it [CONTAINER] /bin/sh
  ```
- 与宿主机相互传输文件(夹)

  ```bash
  # 从容器复制文件到宿主机
  docker cp CONTAINER:/path/in/container /path/on/host

  # 从宿主机复制文件到容器
  docker cp /path/on/host CONTAINER:/path/in/container

  # 从容器复制目录到宿主机
  docker cp CONTAINER:/path/in/container /path/on/host

  # 从宿主机复制目录到容器
  docker cp /path/on/host CONTAINER:/path/in/container
  ```

## 镜像相关

### 镜像导入/导出

- 查看宿主机所有镜像

  ```bash
  docker images
  ```

- 使用`save`命令，通过镜像 id 导出镜像到宿主机当前文件夹下

  ```bash
  docker save -o qinglong.tar whyour/qinglong:latest
  ```

- 执行以下命令进行镜像导入
  ```bash
  docker load < qinglong.tar
  ```

### 更改镜像储存位置

- 默认情况下 Docker 容器的存放位置在`/var/lib/docker`目录下面
- 可以通过下面命令查看具体位置
  ```bash
  sudo docker info | grep "Docker Root Dir"
  ```
- 解决默认存储容量不足的情况，最直接且最有效的方法就是挂载新的分区到该目录。但是在原有系统空间不变的情况下，所以采用软链接的方式，修改镜像和容器的存放路径达到同样的目的。

  ```bash
  # 停掉Docker服务
  systemctl restart docker

  # 停掉Docker服务
  service docker stop
  ```

- 然后移动整个`/var/lib/docker`目录到空间不较大的目的路径。这时候启动 `Docker` 时发现存储目录依旧是 `/var/lib/docker` 目录，但是实际上是存储在数据盘 `/data/docker` 上了

  ```bash
  # 移动原有的内容
  mv /var/lib/docker /data/docker

  # 进行链接
  ln -sf /data/docker /var/lib/docker
  ```

## 网络相关

```bash
docker network ls  # 列出所有网络。
docker network create <network>  # 创建一个新的网络。
docker network rm <network>  # 删除指定的网络。
docker network connect <network> <container>  # 连接容器到网络。
docker network disconnect <network> <container>  # 断开容器与网络的连接。
```

# Docker Compose

## 创建 Compose

1. 编写 `docker-compose.yml` 文件

2. 执行文件

```bash
docker compose up
docker compose up -d  # 后台运行
```
