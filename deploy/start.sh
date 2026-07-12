#!/bin/sh
# slimechan3 起動スクリプト（macOS / Linux 用）
# Next.js standalone サーバ内部由来の DEP0169 警告を抑止して起動する。
cd "$(dirname "$0")"

# --disable-warning は Node v20.11 以降。未対応の Node では付けずに起動する。
if node --disable-warning=DEP0169 -e "" >/dev/null 2>&1; then
	export NODE_OPTIONS="${NODE_OPTIONS:+$NODE_OPTIONS }--disable-warning=DEP0169"
fi

exec node server.js
