import os
import sys
import subprocess
import getpass

def install_dependency(package):
    print(f"Installing missing dependency: {package}...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", package])

# Make sure psycopg2 is installed
try:
    import psycopg2
except ImportError:
    try:
        install_dependency("psycopg2-binary")
        import psycopg2
    except Exception as e:
        print(f"Failed to install psycopg2-binary: {e}")
        print("Please run: .venv\\Scripts\\pip install psycopg2-binary")
        sys.exit(1)

# Database details
HOST = "db.tekbwxsifigakxcufaww.supabase.co"
PORT = "5432"
USER = "postgres"
DBNAME = "postgres"

def main():
    print("==================================================")
    print("         D-NET Supabase Database Setup            ")
    print("==================================================")
    print(f"Host: {HOST}")
    print(f"User: {USER}")
    print()
    
    password = getpass.getpass("Enter your Supabase Database Password: ")
    if not password:
        print("Error: Password cannot be empty.")
        return

    print("\nConnecting to database...")
    try:
        conn = psycopg2.connect(
            host=HOST,
            port=PORT,
            user=USER,
            password=password,
            dbname=DBNAME,
            sslmode="require"
        )
        conn.autocommit = True
        print("Connection successful!")
    except Exception as e:
        print(f"Database connection failed: {e}")
        print("\nMake sure your password is correct and your IP is allowed if you set up restrictions.")
        return

    # Read SQL script
    script_path = os.path.join(os.path.dirname(__file__), "supabase_schema.sql")
    if not os.path.exists(script_path):
        print(f"Error: Schema script not found at {script_path}")
        return

    with open(script_path, "r", encoding="utf-8") as f:
        sql = f.read()

    print("\nExecuting database setup script...")
    try:
        with conn.cursor() as cursor:
            cursor.execute(sql)
        print("\n==================================================")
        print("🚀 Database configured successfully in Supabase!")
        print("All tables (profiles, realms, dreams, chronicles)")
        print("have been created and seeded with default data.")
        print("==================================================")
    except Exception as e:
        print(f"Failed to run schema script: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    main()
