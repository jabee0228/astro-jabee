#!/bin/bash

# 1. 取得基礎日期作為目錄名稱 (格式: YYMMDD，例如 260818)
BASE_DIR=$(date +"%y%m%d")
DIR_NAME="$BASE_DIR"

# 2. 檢查目錄是否存在，若存在則自動加上 -2, -3...
COUNTER=2
while [ -d "./$DIR_NAME" ]; do
    DIR_NAME="${BASE_DIR}-${COUNTER}"
    ((COUNTER++))
done

# 3. 取得目前時間 (格式: YYYY-MM-DDTHH:MM:SS+TZ)
CURRENT_TIME=$(date +"%Y-%m-%dT%H:%M:%S%:z")

# 4. 建立目錄 (這時候的 DIR_NAME 已經是確定不重複的了)
mkdir -p "./$DIR_NAME"

# 5. 設定檔案路徑
FILE_PATH="./$DIR_NAME/index.md"

# 6. 將內容寫入 index.md
cat <<EOF > "$FILE_PATH"
---
date: '$CURRENT_TIME'
title: ''
categories: [""]
tags: [""]
---
EOF

echo "✅ 成功建立文章目錄與檔案：$FILE_PATH"
