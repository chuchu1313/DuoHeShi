# LINE Bot 喝水提醒機器人

## 概述

本專案是一個 LINE Bot，幫助使用者定期提醒喝水。機器人會追蹤使用者的飲水情況，並在尚未達到推薦飲水量時發送提醒。

## 功能

- 使用者可透過發送數字訊息來記錄飲水量。
- 以群組和使用者為單位，將飲水資料儲存在本地快取中。
- 機器人會在每天 10:00 AM - 6:00 PM 之間每小時發送提醒。
- 可在群組聊天中使用。

## 需求

- Node.js (>=14.x)
- npm 或 yarn
- LINE Bot API 憑證：
  - Channel ID
  - Channel Secret
  - Channel Access Token

## 安裝

1. Clone 此專案：

   ```sh
   git clone <repository-url>
   cd <project-folder>
   ```

2. 安裝相依套件：

   ```sh
   npm install
   ```

3. 設定環境變數：

   ```sh
   export TOKEN=<你的 LINE Bot Access Token>
   export SECRET=<你的 LINE Bot Secret>
   export BOT_ID=<你的 LINE Bot ID>
   ```

4. 啟動伺服器：

   ```sh
   npm start
   ```

## API 端點

### `GET /`

- health check endpoint，若伺服器運行正常則回傳狀態 `200`。

### `POST /webhook`

- 處理來自 LINE 的訊息與事件。
- 若接收到數字訊息，則記錄使用者的飲水量。
- 若訊息格式不符，則忽略。

## 運作方式

- 群組內的使用者可發送 10 到 1000 之間的數字來記錄飲水量。
- 機器人將飲水數據儲存在 `LOCAL_CACHE`，以群組 ID、使用者 ID 和日期作為索引。
- 每小時（10:00 AM - 6:00 PM）檢查每位使用者是否達到推薦飲水量。
- 若使用者未達標，則發送提醒。

## 喝水提醒時間表

| 時間    | 推薦飲水量 (ml) |
| ----- | ---------- |
| 10:00 | 200        |
| 11:00 | 300        |
| 12:00 | 400        |
| 13:00 | 500        |
| 14:00 | 700        |
| 15:00 | 850        |
| 16:00 | 1000       |
| 17:00 | 1100       |
| 18:00 | 1200       |

## 疑難排解

- **機器人沒有回應訊息**

  - 確保機器人已加入群組。
  - 檢查 LINE Developer Console 中的 Webhook URL 設定。
  - 確保 `TOKEN` 和 `SECRET` 環境變數設定正確。

- **未發送提醒**

  - 檢查伺服器日誌，確認定時任務是否運行。
  - 確保本地快取正確存儲使用者數據。

