"""
Export and AI Analysis Module
"""
import os
import csv
import json
import datetime
import tkinter as tk
from tkinter import messagebox, simpledialog, filedialog

# Path utilities for handling user data directory
try:
    from path_utils import get_user_data_file
    PATH_UTILS_AVAILABLE = True
except Exception:
    try:
        # Try relative import if path_utils is in parent directory
        import sys
        import os
        sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        from path_utils import get_user_data_file
        PATH_UTILS_AVAILABLE = True
    except Exception:
        PATH_UTILS_AVAILABLE = False

# Support multiple AI providers
GEMINI_AVAILABLE = False
QWEN_AVAILABLE = False
OPENAI_AVAILABLE = False

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except Exception:
    genai = None

try:
    import dashscope
    QWEN_AVAILABLE = True
except Exception:
    dashscope = None

try:
    import openai
    OPENAI_AVAILABLE = True
except Exception:
    openai = None


class ExportAnalyzer:
    """Export and AI Analysis Class"""
    
    def __init__(self, trade_manager, simulator):
        self.trade_manager = trade_manager
        self.simulator = simulator
    
    def export_data(self):
        """Export trade data to CSV files and generate reports"""
        try:
            # Let user select export directory
            export_dir = filedialog.askdirectory(title="Select Export Directory")
            if not export_dir:
                return
            
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            
            # 1. Export trades.csv
            trades_file = os.path.join(export_dir, f"trades_{timestamp}.csv")
            records = self.trade_manager.get_trade_records()
            if records:
                with open(trades_file, 'w', newline='', encoding='utf-8') as f:
                    writer = csv.DictWriter(f, fieldnames=['date', 'stock_code', 'stock_name', 'trade_type', 'shares', 'price', 'total_amount'])
                    writer.writeheader()
                    writer.writerows(records)
            
            # 2. Export equity_curve.csv
            curve_file = os.path.join(export_dir, f"equity_curve_{timestamp}.csv")
            curve = self.simulator._build_equity_curve(include_current=True)
            if curve:
                with open(curve_file, 'w', newline='', encoding='utf-8') as f:
                    writer = csv.writer(f)
                    writer.writerow(['date', 'equity'])
                    for date, equity in sorted(curve, key=lambda x: x[0]):
                        writer.writerow([date.strftime('%Y-%m-%d'), f"{equity:.2f}"])
            
            # 3. Export positions.csv
            positions_file = os.path.join(export_dir, f"positions_{timestamp}.csv")
            portfolio = self.trade_manager.get_portfolio()
            stocks = self.simulator.stocks
            with open(positions_file, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow(['stock_code', 'stock_name', 'shares', 'cost_basis', 'current_price', 'current_value', 'profit_loss', 'profit_loss_pct'])
                for code, info in portfolio.items():
                    shares = info['shares']
                    cost = info['total_cost']
                    current_price = stocks.get(code, {}).get('price', 0)
                    current_value = current_price * shares
                    profit_loss = current_value - cost
                    profit_loss_pct = (profit_loss / cost * 100) if cost > 0 else 0
                    stock_name = stocks.get(code, {}).get('name', code)
                    writer.writerow([code, stock_name, shares, f"{cost:.2f}", f"{current_price:.2f}", f"{current_value:.2f}", f"{profit_loss:.2f}", f"{profit_loss_pct:.2f}"])
            
            # 4. Generate report.json
            report_json_file = os.path.join(export_dir, f"report_{timestamp}.json")
            stats = self.simulator._compute_performance_stats(curve)
            cash = self.trade_manager.get_cash()
            current_total_value = cash + sum(
                stocks.get(code, {}).get('price', 0) * info['shares'] 
                for code, info in portfolio.items()
            )
            
            report_data = {
                'export_date': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'initial_cash': self.trade_manager.initial_cash,
                'current_cash': cash,
                'current_total_value': current_total_value,
                'performance_metrics': {
                    'total_return': stats.get('total_return', 0),
                    'cagr': stats.get('cagr', 0),
                    'sharpe_ratio': stats.get('sharpe', 0),
                    'max_drawdown': stats.get('max_dd', 0),
                    'win_rate': stats.get('win_rate', 0),
                    'profit_factor': stats.get('profit_factor', 0)
                },
                'portfolio_summary': {
                    'num_positions': len(portfolio),
                    'num_trades': len(records),
                    'positions': [
                        {
                            'code': code,
                            'name': stocks.get(code, {}).get('name', code),
                            'shares': info['shares'],
                            'cost_basis': info['total_cost'],
                            'current_price': stocks.get(code, {}).get('price', 0),
                            'current_value': stocks.get(code, {}).get('price', 0) * info['shares'],
                            'profit_loss': (stocks.get(code, {}).get('price', 0) * info['shares']) - info['total_cost']
                        }
                        for code, info in portfolio.items()
                    ]
                },
                'top_trades': self._get_top_trades(records, limit=10)
            }
            
            with open(report_json_file, 'w', encoding='utf-8') as f:
                json.dump(report_data, f, ensure_ascii=False, indent=2)
            
            # 5. Generate report.md
            report_md_file = os.path.join(export_dir, f"report_{timestamp}.md")
            self._generate_markdown_report(report_data, report_md_file)
            
            messagebox.showinfo("Export Success", f"Data exported to:\n{export_dir}\n\nFiles included:\n- trades_{timestamp}.csv\n- equity_curve_{timestamp}.csv\n- positions_{timestamp}.csv\n- report_{timestamp}.json\n- report_{timestamp}.md")
        except Exception as e:
            messagebox.showerror("Export Failed", f"Error exporting data:\n{str(e)}")
            print(f"Export error: {e}")

    def _get_top_trades(self, records, limit=10):
        """Get best and worst trades"""
        holdings = {}
        avg_cost = {}
        trades_pnl = []
        
        for rec in records:
            code = rec['stock_code']
            shares = int(rec['shares'])
            price = float(rec['price'])
            
            if rec['trade_type'] == 'Buy':
                prev_shares = holdings.get(code, 0)
                prev_cost = avg_cost.get(code, 0.0) * prev_shares
                new_total_shares = prev_shares + shares
                new_total_cost = prev_cost + shares * price
                holdings[code] = new_total_shares
                avg_cost[code] = new_total_cost / new_total_shares if new_total_shares > 0 else 0.0
            else:
                if holdings.get(code, 0) <= 0:
                    continue
                cost_basis = avg_cost.get(code, 0.0)
                pnl = (price - cost_basis) * shares
                trades_pnl.append({
                    'date': rec['date'],
                    'code': code,
                    'name': rec['stock_name'],
                    'shares': shares,
                    'entry_price': cost_basis,
                    'exit_price': price,
                    'pnl': pnl
                })
                holdings[code] = holdings.get(code, 0) - shares
                if holdings[code] <= 0:
                    holdings.pop(code, None)
                    avg_cost.pop(code, None)
        
        trades_pnl.sort(key=lambda x: x['pnl'], reverse=True)
        return {
            'best': trades_pnl[:limit] if len(trades_pnl) > limit else trades_pnl,
            'worst': trades_pnl[-limit:] if len(trades_pnl) > limit else trades_pnl
        }

    def _generate_markdown_report(self, report_data, output_file):
        """Generate human-readable Markdown report"""
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("# Trading Review Report\n\n")
            f.write(f"**Generated Time**: {report_data['export_date']}\n\n")
            
            f.write("## 📊 Account Overview\n\n")
            f.write(f"- **Initial Capital**: ${report_data['initial_cash']:,.2f}\n")
            f.write(f"- **Current Cash**: ${report_data['current_cash']:,.2f}\n")
            f.write(f"- **Total Assets**: ${report_data['current_total_value']:,.2f}\n")
            f.write(f"- **Number of Positions**: {report_data['portfolio_summary']['num_positions']}\n")
            f.write(f"- **Number of Trades**: {report_data['portfolio_summary']['num_trades']}\n\n")
            
            metrics = report_data['performance_metrics']
            f.write("## 📈 Performance Metrics\n\n")
            f.write(f"- **Total Return**: {metrics['total_return']*100:.2f}%\n")
            f.write(f"- **Annualized Return (CAGR)**: {metrics['cagr']*100:.2f}%\n")
            f.write(f"- **Sharpe Ratio**: {metrics['sharpe_ratio']:.2f}\n")
            f.write(f"- **Max Drawdown**: {metrics['max_drawdown']*100:.2f}%\n")
            f.write(f"- **Win Rate**: {metrics['win_rate']:.1f}%\n")
            f.write(f"- **Profit Factor**: {metrics['profit_factor']:.2f}\n\n")
            
            if report_data['portfolio_summary']['positions']:
                f.write("## 💼 Current Positions\n\n")
                f.write("| Code | Name | Shares | Cost | Current Price | Current Value | P&L | P&L % |\n")
                f.write("|------|------|--------|------|---------------|---------------|-----|-------|\n")
                for pos in report_data['portfolio_summary']['positions']:
                    profit_loss_pct = (pos['profit_loss'] / pos['cost_basis'] * 100) if pos['cost_basis'] > 0 else 0
                    f.write(f"| {pos['code']} | {pos['name']} | {pos['shares']} | ${pos['cost_basis']:.2f} | ${pos['current_price']:.2f} | ${pos['current_value']:.2f} | ${pos['profit_loss']:.2f} | {profit_loss_pct:.2f}% |\n")
                f.write("\n")
            
            top_trades = report_data.get('top_trades', {})
            if top_trades.get('best'):
                f.write("## 🏆 Best Trades\n\n")
                f.write("| Date | Code | Name | Shares | Entry Price | Exit Price | P&L |\n")
                f.write("|------|------|------|--------|-------------|------------|-----|\n")
                for trade in top_trades['best']:
                    f.write(f"| {trade['date']} | {trade['code']} | {trade['name']} | {trade['shares']} | ${trade['entry_price']:.2f} | ${trade['exit_price']:.2f} | ${trade['pnl']:.2f} |\n")
                f.write("\n")
            
            if top_trades.get('worst'):
                f.write("## ⚠️ Worst Trades\n\n")
                f.write("| Date | Code | Name | Shares | Entry Price | Exit Price | P&L |\n")
                f.write("|------|------|------|--------|-------------|------------|-----|\n")
                for trade in top_trades['worst']:
                    f.write(f"| {trade['date']} | {trade['code']} | {trade['name']} | {trade['shares']} | ${trade['entry_price']:.2f} | ${trade['exit_price']:.2f} | ${trade['pnl']:.2f} |\n")
                f.write("\n")

    def generate_ai_analysis(self):
        """Generate AI-powered trading analysis and suggestions"""
        try:
            # Check if any AI provider is available
            if not OPENAI_AVAILABLE and not GEMINI_AVAILABLE and not QWEN_AVAILABLE:
                self._show_ai_setup_dialog()
                return
            
            # Let user select AI provider
            provider = self._select_ai_provider()
            if not provider:
                return
            
            # Get API key
            api_key = self._get_api_key(provider)
            if not api_key:
                api_key = self._request_api_key(provider)
                if not api_key:
                    messagebox.showinfo(
                        "API Key Required",
                        "AI 分析功能需要先配置对应服务商的 API Key。\n\n"
                        "您已取消输入，当前不会调用 AI 接口。\n\n"
                        "详细获取与配置步骤请查看项目根目录中的：\n"
                        "- AI_ANALYSIS_GUIDE.md\n"
                        "- AI_PROVIDERS_GUIDE.md",
                    )
                    return
                self._save_api_key(provider, api_key)
            
            # Show loading
            loading_window = tk.Toplevel(self.simulator.root)
            loading_window.title("AI Analyzing...")
            loading_window.geometry("400x100")
            loading_window.transient(self.simulator.root)
            provider_names = {
                'openai': 'OpenAI (GPT)',
                'gemini': 'Google Gemini',
                'qwen': 'Qwen (DashScope)'
            }
            provider_name = provider_names.get(provider, 'AI')
            loading_label = tk.Label(
                loading_window,
                text=f"Generating AI analysis report using {provider_name}, please wait...",
                font=('Segoe UI', 12)
            )
            loading_label.pack(expand=True)
            loading_window.update()
            
            # Generate report data
            curve = self.simulator._build_equity_curve(include_current=True)
            stats = self.simulator._compute_performance_stats(curve)
            records = self.trade_manager.get_trade_records()
            top_trades = self._get_top_trades(records, limit=5)
            portfolio = self.trade_manager.get_portfolio()
            
            # Prepare AI prompt
            prompt = self._build_ai_prompt(stats, records, top_trades, portfolio)
            
            # Call AI API
            try:
                if provider == 'openai':
                    ai_suggestions = self._call_openai_api(api_key, prompt)
                elif provider == 'gemini':
                    ai_suggestions = self._call_gemini_api(api_key, prompt)
                elif provider == 'qwen':
                    ai_suggestions = self._call_qwen_api(api_key, prompt)
                else:
                    raise ValueError(f"Unsupported AI provider: {provider}")
            except Exception as e:
                loading_window.destroy()
                error_msg = str(e)
                if "region" in error_msg.lower() or "location" in error_msg.lower() or "restricted" in error_msg.lower():
                    messagebox.showerror(
                        "AI Analysis Failed",
                        f"Region restriction error:\n{error_msg}\n\n"
                        f"Suggestions:\n"
                        f"1. Try using Qwen (DashScope) - fully available in China\n"
                        f"2. Install: pip install dashscope\n"
                        f"3. Get API Key: https://dashscope.console.aliyun.com/apiKey"
                    )
                else:
                    messagebox.showerror("AI Analysis Failed", f"Error calling AI API:\n{error_msg}\n\nPlease check:\n1. Is API Key correct\n2. Is network connection normal\n3. Is API quota exhausted")
                return
            
            loading_window.destroy()
            
            # Show results
            self._show_ai_analysis_window(ai_suggestions, stats)
            
        except Exception as e:
            messagebox.showerror("Error", f"Error generating AI analysis:\n{str(e)}")
            print(f"AI analysis error: {e}")
    
    def _show_ai_setup_dialog(self):
        """Show AI setup dialog"""
        messagebox.showinfo(
            "AI Feature Setup",
            "要使用 AI 分析功能，需要先安装至少一个 AI 库并获取对应的 API Key。\n\n"
            "可选服务商：\n\n"
            "1. OpenAI (GPT-3.5/GPT-4):\n"
            "   pip install openai\n"
            "   获取 API Key: https://platform.openai.com/api-keys\n\n"
            "2. Qwen (DashScope)（推荐，国内可用）：\n"
            "   pip install dashscope\n"
            "   获取 API Key: https://dashscope.console.aliyun.com/apiKey\n\n"
            "3. Google Gemini:\n"
            "   pip install google-generativeai\n"
            "   获取 API Key: https://makersuite.google.com/app/apikey\n\n"
            "详细安装与配置步骤请参见项目根目录：\n"
            "- AI_ANALYSIS_GUIDE.md\n"
            "- AI_PROVIDERS_GUIDE.md\n\n"
            "安装完成后请重启程序。"
        )
    
    def _select_ai_provider(self):
        """Let user select AI provider"""
        available_providers = []
        if OPENAI_AVAILABLE:
            available_providers.append(('openai', 'OpenAI (GPT)'))
        if GEMINI_AVAILABLE:
            available_providers.append(('gemini', 'Google Gemini'))
        if QWEN_AVAILABLE:
            available_providers.append(('qwen', 'Qwen (DashScope)'))
        
        if not available_providers:
            self._show_ai_setup_dialog()
            return None
        
        if len(available_providers) == 1:
            # Only one available, use it directly
            return available_providers[0][0]
        
        # Multiple available, let user choose
        dialog = tk.Toplevel(self.simulator.root)
        dialog.title("Select AI Provider")
        dialog.geometry("400x250")
        dialog.transient(self.simulator.root)
        dialog.grab_set()
        
        selected_provider = {'value': None}
        
        frame = tk.Frame(dialog, bg=self.simulator.bg_color)
        frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        tk.Label(
            frame,
            text="Please select AI provider:",
            font=('Segoe UI', 12, 'bold'),
            bg=self.simulator.bg_color,
            fg=self.simulator.text_color
        ).pack(pady=(0, 15))
        
        def select_provider(provider_id):
            selected_provider['value'] = provider_id
            dialog.destroy()
        
        for provider_id, provider_name in available_providers:
            btn = tk.Button(
                frame,
                text=provider_name,
                command=lambda p=provider_id: select_provider(p),
                bg=self.simulator.accent_color,
                fg='white',
                font=('Segoe UI', 11),
                relief='flat',
                cursor='hand2',
                padx=20,
                pady=10,
                width=20
            )
            btn.pack(pady=5)
        
        dialog.wait_window()
        return selected_provider['value']
    
    def _call_gemini_api(self, api_key, prompt):
        """Call Google Gemini API"""
        if not GEMINI_AVAILABLE:
            raise ImportError("google-generativeai library not installed")
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        return response.text
    
    def _call_qwen_api(self, api_key, prompt):
        """Call Qwen API"""
        if not QWEN_AVAILABLE:
            raise ImportError("dashscope library not installed")
        dashscope.api_key = api_key
        from dashscope import Generation
        
        response = Generation.call(
            model='qwen-turbo',
            prompt=prompt,
            max_tokens=2000,
            temperature=0.7
        )
        
        if response.status_code == 200:
            return response.output.text
        else:
            raise Exception(f"API call failed: {response.message}")
    
    def _call_openai_api(self, api_key, prompt):
        """Call OpenAI API"""
        if not OPENAI_AVAILABLE:
            raise ImportError("openai library not installed")
        
        # Use new version of OpenAI API (v1.0+)
        from openai import OpenAI
        client = OpenAI(api_key=api_key)
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a professional quantitative trading analyst."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=2000,
            temperature=0.7
        )
        
        return response.choices[0].message.content
    
    def _get_api_key(self, provider):
        """Get saved API key"""
        if PATH_UTILS_AVAILABLE:
            key_file = get_user_data_file(f".{provider}_api_key")
        else:
            key_file = os.path.join(self.trade_manager.base_dir, f".{provider}_api_key")
        if os.path.exists(key_file):
            try:
                with open(key_file, 'r', encoding='utf-8') as f:
                    return f.read().strip()
            except Exception:
                return None
        return None
    
    def _save_api_key(self, provider, api_key):
        """Save API key"""
        if PATH_UTILS_AVAILABLE:
            key_file = get_user_data_file(f".{provider}_api_key")
        else:
            key_file = os.path.join(self.trade_manager.base_dir, f".{provider}_api_key")
        try:
            with open(key_file, 'w', encoding='utf-8') as f:
                f.write(api_key)
        except Exception:
            pass
    
    def _request_api_key(self, provider):
        """Request user to input API key"""
        if provider == 'openai':
            title = "OpenAI API Key"
            instructions = "Please enter OpenAI API Key:\n\nGet it at: https://platform.openai.com/api-keys"
        elif provider == 'gemini':
            title = "Gemini API Key"
            instructions = "Please enter Google Gemini API Key:\n\nGet it free at: https://makersuite.google.com/app/apikey"
        elif provider == 'qwen':
            title = "Qwen API Key"
            instructions = "Please enter Qwen (DashScope) API Key:\n\nGet it free at: https://dashscope.console.aliyun.com/apiKey\n\nNew users get free credits!"
        else:
            title = "API Key"
            instructions = "Please enter API Key:"
        
        api_key = simpledialog.askstring(
            title,
            instructions + "\n\nAPI Key:",
            parent=self.simulator.root
        )
        return api_key


    def _build_ai_prompt(self, stats, records, top_trades, portfolio):
        """Build AI analysis prompt"""
        prompt = f"""You are a professional quantitative trading analyst. Please provide professional analysis and improvement suggestions based on the following trading data.

## Account Overview
- Initial Capital: ${self.trade_manager.initial_cash:,.2f}
- Current Cash: ${self.trade_manager.get_cash():,.2f}
- Current Number of Positions: {len(portfolio)}

## Performance Metrics
- Total Return: {stats.get('total_return', 0)*100:.2f}%
- Annualized Return (CAGR): {stats.get('cagr', 0)*100:.2f}%
- Sharpe Ratio: {stats.get('sharpe', 0):.2f}
- Max Drawdown: {stats.get('max_dd', 0)*100:.2f}%
- Win Rate: {stats.get('win_rate', 0):.1f}%
- Profit Factor: {stats.get('profit_factor', 0):.2f}

## Trading Statistics
- Total Number of Trades: {len(records)}
- Number of Buys: {sum(1 for r in records if r['trade_type'] == 'Buy')}
- Number of Sells: {sum(1 for r in records if r['trade_type'] == 'Sell')}

## Best Trades (Top 5)
"""
        if top_trades.get('best'):
            for i, trade in enumerate(top_trades['best'][:5], 1):
                prompt += f"{i}. {trade['date']} {trade['code']} ({trade['name']}): {trade['shares']} shares, Entry ${trade['entry_price']:.2f} -> Exit ${trade['exit_price']:.2f}, P&L ${trade['pnl']:.2f}\n"
        else:
            prompt += "No complete trade records available\n"

        prompt += "\n## Worst Trades (Bottom 5)\n"
        if top_trades.get('worst'):
            for i, trade in enumerate(top_trades['worst'][:5], 1):
                prompt += f"{i}. {trade['date']} {trade['code']} ({trade['name']}): {trade['shares']} shares, Buy ${trade['entry_price']:.2f} -> Sell ${trade['exit_price']:.2f}, P&L ${trade['pnl']:.2f}\n"
        else:
            prompt += "No complete trade records available\n"

        prompt += """
## Please provide the following analysis:

1. **Core Problem Diagnosis** (3-5 main issues, each with specific data support)
2. **Improvement Suggestions** (3-5 actionable, quantifiable improvement measures)
3. **Risk Warnings** (Main risk points of current strategy)
4. **Next Action Plan** (Specific, actionable optimization directions)

Please answer in English, language should be professional but understandable, suggestions should be specific and actionable.
"""
        return prompt

    def _show_ai_analysis_window(self, ai_text, stats):
        """Show AI analysis in new window"""
        window = tk.Toplevel(self.simulator.root)
        window.title("AI Trading Analysis Report")
        window.geometry("800x600")
        window.transient(self.simulator.root)
        
        # Create scrollable text component
        frame = tk.Frame(window, bg=self.simulator.bg_color)
        frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        tk.Label(
            frame,
            text="🤖 AI Trading Analysis Report",
            font=('Segoe UI', 16, 'bold'),
            bg=self.simulator.bg_color,
            fg=self.simulator.text_color
        ).pack(pady=(0, 10))
        
        # Performance summary
        summary_frame = tk.Frame(frame, bg=self.simulator.panel_bg, relief=tk.RAISED, borderwidth=1)
        summary_frame.pack(fill=tk.X, pady=(0, 10))
        tk.Label(
            summary_frame,
            text=f"Total Return: {stats.get('total_return', 0)*100:.2f}% | "
                 f"Sharpe Ratio: {stats.get('sharpe', 0):.2f} | "
                 f"Max Drawdown: {stats.get('max_dd', 0)*100:.2f}% | "
                 f"Win Rate: {stats.get('win_rate', 0):.1f}%",
            font=('Segoe UI', 10),
            bg=self.simulator.panel_bg,
            fg=self.simulator.text_color
        ).pack(pady=5)
        
        # AI analysis text
        text_widget = tk.Text(
            frame,
            wrap=tk.WORD,
            font=('Segoe UI', 11),
            bg=self.simulator.panel_bg,
            fg=self.simulator.text_color,
            padx=10,
            pady=10
        )
        text_widget.pack(fill=tk.BOTH, expand=True)
        text_widget.insert('1.0', ai_text)
        text_widget.config(state=tk.DISABLED)
        
        # Scrollbar
        scrollbar = tk.Scrollbar(text_widget, command=text_widget.yview)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        text_widget.config(yscrollcommand=scrollbar.set)
        
        # Export button
        tk.Button(
            frame,
            text="💾 Save Report",
            command=lambda: self._save_ai_report(ai_text, stats),
            bg=self.simulator.accent_color,
            fg='white',
            font=('Segoe UI', 10, 'bold'),
            relief='flat',
            cursor='hand2',
            padx=15,
            pady=5
        ).pack(pady=10)

    def _save_ai_report(self, ai_text, stats):
        """Save AI analysis report to file"""
        try:
            export_dir = filedialog.askdirectory(title="Select Save Directory")
            if not export_dir:
                return
            
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            report_file = os.path.join(export_dir, f"ai_analysis_{timestamp}.md")
            
            with open(report_file, 'w', encoding='utf-8') as f:
                f.write("# AI Trading Analysis Report\n\n")
                f.write(f"**Generated Time**: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                f.write(f"**Performance Overview**: Total Return {stats.get('total_return', 0)*100:.2f}% | "
                       f"Sharpe Ratio {stats.get('sharpe', 0):.2f} | "
                       f"Max Drawdown {stats.get('max_dd', 0)*100:.2f}% | "
                       f"Win Rate {stats.get('win_rate', 0):.1f}%\n\n")
                f.write("---\n\n")
                f.write(ai_text)
            
            messagebox.showinfo("Save Success", f"AI analysis report saved to:\n{report_file}")
        except Exception as e:
            messagebox.showerror("Save Failed", f"Error saving report:\n{str(e)}")

