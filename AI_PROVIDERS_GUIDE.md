# AI Provider Usage Guide

## 🌍 Supported AI Providers

This program supports multiple AI providers. You can choose the most suitable one based on your region:

### 1. Qwen (Tongyi Qianwen) - Recommended for users in China

**Advantages**:
- ✅ Available in China, no regional restrictions
- ✅ Free credits for new users upon registration
- ✅ Excellent Chinese language support
- ✅ Fast response speed

**Get API Key**:
1. Visit: https://dashscope.console.aliyun.com/apiKey
2. Login with Alibaba Cloud account (free registration if you don't have one)
3. Click "Create API Key"
4. Copy the generated API Key

**Install dependency**:
```bash
pip install dashscope
```

**Free quota**:
- Free credits for new users upon registration
- Check DashScope console for specific quota

### 2. Google Gemini

**Advantages**:
- ✅ Generous free quota
- ✅ High analysis quality

**Disadvantages**:
- ❌ May not be accessible in some regions (requires VPN)

**Get API Key**:
1. Visit: https://makersuite.google.com/app/apikey
2. Login with Google account
3. Click "Create API Key"
4. Copy the generated API Key

**Install dependency**:
```bash
pip install google-generativeai
```

**Free quota**:
- 15 requests per minute
- Sufficient for personal use per month

### 3. OpenAI

**Advantages**:
- ✅ High quality analysis
- ✅ Widely used

**Disadvantages**:
- ❌ Paid service (pay per use)
- ❌ May require VPN in some regions

**Get API Key**:
1. Visit: https://platform.openai.com/api-keys
2. Login with OpenAI account
3. Create API Key
4. Copy the generated API Key

**Install dependency**:
```bash
pip install openai
```

## 🚀 Quick Start

### Option 1: Use Qwen (Recommended for users in China)

1. **Install dependency**:
```bash
pip install dashscope
```

2. **Get API Key**:
   - Visit: https://dashscope.console.aliyun.com/apiKey
   - Register/Login with Alibaba Cloud account
   - Create API Key

3. **Use**:
   - Run the program
   - Click "🤖 AI Analysis" button
   - Select "Qwen (Tongyi Qianwen)"
   - Enter API Key (will be saved after first input)

### Option 2: Use Google Gemini

1. **Install dependency**:
```bash
pip install google-generativeai
```

2. **Get API Key**:
   - Visit: https://makersuite.google.com/app/apikey
   - Login with Google account
   - Create API Key

3. **Use**:
   - Run the program
   - Click "🤖 AI Analysis" button
   - Select "Google Gemini"
   - Enter API Key (will be saved after first input)

### Option 3: Use OpenAI

1. **Install dependency**:
```bash
pip install openai
```

2. **Get API Key**:
   - Visit: https://platform.openai.com/api-keys
   - Login with OpenAI account
   - Create API Key

3. **Use**:
   - Run the program
   - Click "🤖 AI Analysis" button
   - Select "OpenAI"
   - Enter API Key (will be saved after first input)

## 🔧 Switch AI Provider

If multiple AI libraries are installed, the program will prompt you to choose which one to use. You can also:

1. Uninstall unnecessary libraries:
```bash
# Only use Qwen
pip uninstall google-generativeai openai

# Or only use Gemini
pip uninstall dashscope openai

# Or only use OpenAI
pip uninstall dashscope google-generativeai
```

2. Or keep multiple and choose each time you use

## ⚠️ Common Issues

### Q: What to do if prompted "Region restricted"?

**A**: This is Google Gemini's regional restriction. Solutions:
1. **Recommended**: Use Qwen, fully available in China
2. Or use VPN to access Google services

### Q: Where to get Qwen's API Key?

**A**: 
1. Visit: https://dashscope.console.aliyun.com/apiKey
2. Need Alibaba Cloud account (free registration)
3. New users get free credits

### Q: Multiple providers installed, how to choose?

**A**: The program will automatically detect installed libraries and let you choose when using. You can also:
- Only install one (recommended)
- Or choose each time you use

### Q: Is API Key safe?

**A**: 
- API Key is saved in local files (`.qwen_api_key`, `.gemini_api_key`, or `.openai_api_key`)
- Not uploaded to any server
- Only your program can access

### Q: What to do when free quota is exhausted?

**A**: 
- **Qwen**: Check DashScope console for paid plans
- **Google Gemini**: Wait for next month reset, or check paid plans
- **OpenAI**: Check paid plans or usage limits

## 📊 Comparison Table

| Feature | Qwen (Tongyi Qianwen) | Google Gemini | OpenAI |
|---------|----------------|--------------|--------|
| Available in China | ✅ Yes | ❌ Requires VPN | ⚠️ May require VPN |
| Free Quota | ✅ New user credits | ✅ Generous | ❌ Paid |
| Chinese Support | ✅ Excellent | ✅ Good | ✅ Good |
| Response Speed | ✅ Fast | ✅ Fast | ✅ Fast |
| Install Command | `pip install dashscope` | `pip install google-generativeai` | `pip install openai` |

## 💡 Recommended Configuration

- **Users in Mainland China**: Use Qwen (Tongyi Qianwen)
- **Overseas Users**: Can use Google Gemini, OpenAI, or Qwen
- **Install Multiple**: Program will automatically let you choose

---

**Enjoy your AI trading analysis!** 🚀
