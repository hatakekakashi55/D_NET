import psycopg2

try:
    conn = psycopg2.connect(host='db.tekbwxsifigakxcufaww.supabase.co', port=5432, user='postgres', password='dharani@29a', dbname='postgres', sslmode='require')
    conn.autocommit = True
    cur = conn.cursor()
    # Create bucket if not exists
    cur.execute('''
        INSERT INTO storage.buckets (id, name, public) 
        VALUES ('avatars', 'avatars', true)
        ON CONFLICT (id) DO NOTHING;
    ''')
    
    try:
        cur.execute('''
            CREATE POLICY "Avatar images are publicly accessible." ON storage.objects
            FOR SELECT USING (bucket_id = 'avatars');
        ''')
    except Exception as e:
        print(f'Policy 1 exists: {e}')

    try:
        cur.execute('''
            CREATE POLICY "Users can upload their own avatars." ON storage.objects
            FOR INSERT WITH CHECK (bucket_id = 'avatars');
        ''')
    except Exception as e:
        print(f'Policy 2 exists: {e}')

    try:
        cur.execute('''
            CREATE POLICY "Users can update their own avatars." ON storage.objects
            FOR UPDATE USING (bucket_id = 'avatars');
        ''')
    except Exception as e:
        print(f'Policy 3 exists: {e}')

    conn.close()
    print('Bucket setup completed')
except Exception as e:
    print(f'Error: {e}')
