# AI Analysis Feature User Guide

## 📋 Feature Overview

This feature provides **trade data export** and **AI-driven trading analysis suggestions** to help you better review and improve your trading strategies.

## 🚀 Quick Start

### 1. Install Dependencies

Export feature requires no additional dependencies, but AI analysis feature requires installing an AI provider library:

```bash
# For Qwen (recommended for users in China)
pip install dashscope

# Or for Google Gemini
pip install google-generativeai

# Or for OpenAI
pip install openai
```

### 2. Choose AI Provider and Get API Key

#### Option 1: Qwen (Tongyi Qianwen) - Recommended for users in China ⭐

1. **Install dependency**:
```bash
pip install dashscope
```

2. **Get API Key**:
   - Visit: https://dashscope.console.aliyun.com/apiKey
   - Login with Alibaba Cloud account (free registration if you don't have one)
   - Click "Create API Key"
   - Copy the generated API Key

**Advantages**:
- ✅ Fully available in China, no regional restrictions
- ✅ Free credits for new users
- ✅ Excellent Chinese language support

#### Option 2: Google Gemini

1. **Install dependency**:
```bash
pip install google-generativeai
```

2. **Get API Key**:
   - Visit: https://makersuite.google.com/app/apikey
   - Login with Google account
   - Click "Create API Key"
   - Copy the generated API Key

**Free quota**:
- 15 requests per minute
- Sufficient for personal use per month
- Completely free, no credit card required

**Note**: Some regions may not be accessible. If you encounter regional restrictions, please use Qwen.

#### Option 3: OpenAI

1. **Install dependency**:
```bash
pip install openai
```

2. **Get API Key**:
   - Visit: https://platform.openai.com/api-keys
   - Login with OpenAI account
   - Create API Key
   - Copy the generated API Key

### 3. Use the Feature

#### 📊 Export Data

1. Click the **"📊 Export CSV"** button on the interface
2. Select export directory
3. System will automatically generate the following files:
   - `trades_YYYYMMDD_HHMMSS.csv` - All trade records
   - `equity_curve_YYYYMMDD_HHMMSS.csv` - Equity curve data
   - `positions_YYYYMMDD_HHMMSS.csv` - Current position snapshot
   - `report_YYYYMMDD_HHMMSS.json` - Structured indicator data (JSON format)
   - `report_YYYYMMDD_HHMMSS.md` - Human-readable report (Markdown format)

#### 🤖 AI Analysis

1. Click the **"🤖 AI Analysis"** button on the interface
2. First-time use will prompt for API Key (will be saved after input, automatically used next time)
3. Wait a few seconds, AI will analyze your trade data and generate a report
4. Report includes:
   - **Core Problem Diagnosis**: 3-5 main issues with data support
   - **Improvement Suggestions**: 3-5 executable, quantifiable improvement measures
   - **Risk Warnings**: Main risk points of current strategy
   - **Next Action Plan**: Specific, actionable optimization directions
5. You can click **"💾 Save Report"** to save AI analysis as Markdown file

## 📁 Export File Description

### trades.csv
Contains all trade records, fields:
- `date`: Trade date
- `stock_code`: Stock code
- `stock_name`: Stock name
- `trade_type`: Trade type (Buy/Sell)
- `shares`: Number of shares
- `price`: Execution price
- `total_amount`: Trade amount

### equity_curve.csv
Equity curve data, fields:
- `date`: Date
- `equity`: Total account assets

### positions.csv
Current position snapshot, fields:
- `stock_code`: Stock code
- `stock_name`: Stock name
- `shares`: Position shares
- `cost_basis`: Cost basis
- `current_price`: Current price
- `current_value`: Current value
- `profit_loss`: Profit/loss amount
- `profit_loss_pct`: Profit/loss percentage

### report.json
Structured JSON data, includes:
- Account overview (initial capital, current cash, total assets, etc.)
- Performance metrics (total return, CAGR, Sharpe ratio, max drawdown, win rate, profit factor)
- Position summary
- Best/worst trade lists

### report.md
Human-readable Markdown report, includes:
- Account overview table
- Performance metrics list
- Current positions table
- Best trades table
- Worst trades table

## 🔧 Troubleshooting

### AI Analysis Feature Unavailable

**Issue**: After clicking AI Analysis button, prompted to install AI library

**Solution**:
- **Recommended (users in China)**: `pip install dashscope` (Qwen)
- **Or**: `pip install google-generativeai` (Google Gemini)
- **Or**: `pip install openai` (OpenAI)

### API Key Error

**Issue**: Prompt "API Key incorrect" or "API quota exhausted"

**Solution**:
1. Check if API Key is correctly copied (no extra spaces)
2. Check quota based on provider used:
   - **Qwen**: Visit https://dashscope.console.aliyun.com to check quota
   - **Google Gemini**: Visit https://makersuite.google.com/app/apikey to check quota
   - **OpenAI**: Visit https://platform.openai.com/api-keys to check quota
3. If quota is exhausted, wait for reset or switch to another provider

### Regional Restriction Issue

**Issue**: Prompt regional restriction (Google Gemini)

**Solution**:
1. **Recommended**: Use Qwen, fully available in China
   ```bash
   pip install dashscope
   ```
2. Or use VPN to access Google services

### Export Feature Unavailable

**Issue**: Clicking Export CSV button has no response

**Solution**:
1. Check if `export_analysis.py` file exists
2. Confirm file is in project root directory
3. Check terminal error messages

## 💡 Usage Tips

1. **Regular Export**: Recommend exporting data weekly or monthly to build historical records
2. **Comparative Analysis**: Export data from multiple time periods to compare performance across different periods
3. **AI Suggestions**: AI analysis is based on your actual trade data, suggestions should be combined with your own judgment
4. **Save Reports**: AI analysis reports can be saved as reference for strategy improvement

## 🔒 Privacy Statement

- API Key is saved in project directory files (`.qwen_api_key`, `.gemini_api_key`, or `.openai_api_key`) - local files, not uploaded
- Trade data is only processed locally, not uploaded to any server
- During AI analysis, only structured statistical data is sent to AI provider API
- Complete trade records or personal information are not sent

## 📞 Support

If you encounter issues, please:
1. Check terminal error output
2. Confirm all dependencies are correctly installed
3. Check the troubleshooting section of this document

---

**Enjoy your trading review journey!** 🚀
