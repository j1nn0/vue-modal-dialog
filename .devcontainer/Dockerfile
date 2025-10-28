# バージョンを引数で受け取る
ARG NODE_VERSION=24
ARG PNPM_VERSION=10

# Node.js ベースイメージ
FROM node:${NODE_VERSION}-bookworm

# PNPM インストール
RUN npm install -g npm @antfu/ni pnpm@${PNPM_VERSION}

# ワークディレクトリ
WORKDIR /workspaces/vue-modal-dialog

# node ユーザーで操作できるように所有権を変更
USER root
RUN mkdir -p /workspaces/vue-modal-dialog \
    && chown -R node:node /workspaces/vue-modal-dialog
USER node

# PNPM ストアをホームディレクトリに移動
ENV PNPM_HOME="/home/node/.pnpm-store"
ENV PATH="$PNPM_HOME:$PATH"
RUN pnpm config set store-dir $PNPM_HOME
