#!/usr/bin/env python3
"""Command-line tool for running strategy tournaments.

Usage:
    python run_tournament.py [--start-date YYYY-MM-DD] [--end-date YYYY-MM-DD] [--strategies-dir DIR]
"""

import argparse
import datetime
import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from strategies.tournament_engine import TournamentEngine


def main():
    """Main entry point for tournament runner."""
    parser = argparse.ArgumentParser(
        description="Run algorithmic trading strategy tournament",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Run tournament with default dates (last 60 days)
  python run_tournament.py
  
  # Run tournament for specific date range
  python run_tournament.py --start-date 2024-01-01 --end-date 2024-03-31
  
  # Run tournament with custom strategies directory
  python run_tournament.py --strategies-dir my_strategies
        """
    )
    
    parser.add_argument(
        '--start-date',
        type=str,
        default=None,
        help='Start date (YYYY-MM-DD). Default: 60 days ago'
    )
    
    parser.add_argument(
        '--end-date',
        type=str,
        default=None,
        help='End date (YYYY-MM-DD). Default: today'
    )
    
    parser.add_argument(
        '--strategies-dir',
        type=str,
        default='strategies',
        help='Directory containing strategy files (default: strategies)'
    )
    
    parser.add_argument(
        '--initial-cash',
        type=float,
        default=100000.0,
        help='Initial capital for each strategy (default: 100000)'
    )
    
    parser.add_argument(
        '--fee-rate',
        type=float,
        default=0.0001,
        help='Trading fee rate (default: 0.0001 = 0.01%%)'
    )
    
    parser.add_argument(
        '--use-mock-data',
        action='store_true',
        help='Force use of mock data (for offline testing)'
    )
    
    args = parser.parse_args()
    
    # Parse dates
    if args.end_date:
        try:
            end_date = datetime.datetime.strptime(args.end_date, '%Y-%m-%d').date()
        except ValueError:
            print(f"Error: Invalid end date format: {args.end_date}")
            print("Expected format: YYYY-MM-DD")
            sys.exit(1)
    else:
        end_date = datetime.date.today()
    
    if args.start_date:
        try:
            start_date = datetime.datetime.strptime(args.start_date, '%Y-%m-%d').date()
        except ValueError:
            print(f"Error: Invalid start date format: {args.start_date}")
            print("Expected format: YYYY-MM-DD")
            sys.exit(1)
    else:
        # Default: 60 days before end date
        start_date = end_date - datetime.timedelta(days=60)
    
    if start_date >= end_date:
        print("Error: Start date must be before end date")
        sys.exit(1)
    
    # Check strategies directory
    if not os.path.exists(args.strategies_dir):
        print(f"Error: Strategies directory not found: {args.strategies_dir}")
        sys.exit(1)
    
    print("=" * 80)
    print("The Quant Arena: Algorithmic Trading Tournament")
    print("=" * 80)
    print()
    
    # Create tournament engine
    engine = TournamentEngine(
        strategies_dir=args.strategies_dir,
        initial_cash=args.initial_cash,
        fee_rate=args.fee_rate,
        min_fee=1.0,
        slippage_per_share=0.0,
        use_mock_data=args.use_mock_data
    )
    
    # Run tournament
    try:
        results_df = engine.run_tournament(
            start_date=start_date,
            end_date=end_date,
            stock_codes=None,  # Use all available stocks
            strategy_files=None  # Auto-discover
        )
        
        if len(results_df) == 0:
            print("\nNo results generated. Check that strategy files exist and are valid.")
            sys.exit(1)
        
        print("\n" + "=" * 80)
        print("Tournament completed successfully!")
        print("=" * 80)
        
    except KeyboardInterrupt:
        print("\n\nTournament interrupted by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\nError running tournament: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
