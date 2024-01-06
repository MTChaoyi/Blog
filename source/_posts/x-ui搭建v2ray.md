---
title: x-ui搭建v2ray
date: 2022-03-17 23:56:55
tags:
  - x-ui
  - v2ary
  - VPN
categories:
  - 一点小教程
description: 搭建x-ui框架的v2ary教程
---
# x-ui搭建v2ary

> @vaxilu/x-ui https://github.com/vaxilu/x-ui

# 一键部署代码
`bash <(curl -Ls https://raw.githubusercontent.com/vaxilu/x-ui/master/install.sh)`

# 功能介绍
- 系统状态监控
- 支持多用户多协议，网页可视化操作
- 支持的协议：vmess、vless、trojan、shadowsocks、dokodemo-door、socks、http
- 支持配置更多传输配置
- 流量统计，限制流量，限制到期时间
- 可自定义 xray 配置模板
- 支持 https 访问面板（自备域名 + ssl 证书）
- 更多高级配置项，详见面板

# CentOS 7自带防火墙开放端口

- 查看firewall的状态<br>
`firewall-cmd --state`

- 开放端口<br>
`firewall-cmd --permanent --add-port=XXX/tcp`

- 重启防火墙(修改配置后要重启防火墙)<br>
`firewall-cmd --reload`
