import pandas as pd
import re
import html

# Valid types
VALID_TYPES = [
    'combo', 'live', 'recorded', 'bookstore', 'mock_test',
    'test_series', 'mentorship', 'face_to_face', 'offer', 'general'
]

# Keywords for strict detection
KEYWORDS = {
    'combo': ['combo', 'pack'],
    'recorded_keywords': ['pendrive', 'google drive', 'download', 'video lecture', 'gd', 'pen drive'],
    'mock_test': ['mock test', 'mock_test'],
    'test_series': ['test series', 'test_series'],
    'mentorship': ['mentorship'],
    'face_to_face': ['face to face', 'face_to_face'],
    'offer': ['offer'],
    'bookstore': ['bookstore']
}

def is_recorded(name):
    name_lower = str(name).lower()
    return any(word in name_lower for word in KEYWORDS['recorded_keywords'])

def detect_live(product_name):
    if pd.isna(product_name):
        return False
    name = html.unescape(str(product_name)).lower()
    name = re.sub(r'[^a-z0-9 ]+', ' ', name)
    name = re.sub(r'\s+', ' ', name).strip()
    return 'live' in name

def detect_types_strict(product_name, is_published=1):
    types = []
    name_lower = html.unescape(str(product_name)).lower().strip()

    # COMBO
    if any(word in name_lower for word in KEYWORDS['combo']):
        types.append('combo')

    # RECORDED
    if is_recorded(product_name):
        types.append('recorded')

    # MENTORSHIP
    if any(word in name_lower for word in KEYWORDS['mentorship']):
        types.append('mentorship')

    # MOCK TEST
    if any(word in name_lower for word in KEYWORDS['mock_test']):
        types.append('mock_test')

    # TEST SERIES
    if any(word in name_lower for word in KEYWORDS['test_series']):
        types.append('test_series')

    # FACE_TO_FACE
    if any(word in name_lower for word in KEYWORDS['face_to_face']):
        types.append('face_to_face')

    # OFFER
    if any(word in name_lower for word in KEYWORDS['offer']):
        types.append('offer')

    # BOOKSTORE
    if any(word in name_lower for word in KEYWORDS['bookstore']):
        types.append('bookstore')

    # LIVE detection untouched
    if is_published == 1 and detect_live(product_name):
        types.append('live')

    # GENERAL fallback: sirf jab koi type detect na ho
    if not types:
        types.append('general')

    return types

def clean_existing_types(series):
    def process_type_str(type_str):
        if pd.isna(type_str):
            return []
        types = [t.strip().lower() for t in str(type_str).split(',')]
        return [t for t in types if t in VALID_TYPES]
    return series.apply(process_type_str)

def main():
    input_file = r'C:\sandeep backup\sandeep\FILES\CODE\bulk\products.csv'
    output_file = r'C:\sandeep backup\sandeep\FILES\CODE\bulk\corrected_products.csv'

    try:
        df = pd.read_csv(input_file)
    except FileNotFoundError:
        print(f"❌ File not found: {input_file}")
        return
    except PermissionError:
        print(f"❌ Permission denied: Close the file {input_file}")
        return

    df.rename(columns={'Title': 'Product Name', 'Type': 'Type'}, inplace=True)

    # 'Is Published' column handling
    if 'Is Published' in df.columns:
        published_series = df['Is Published'].astype(str).str.lower().map({'yes':1,'no':0}).fillna(0)
    else:
        published_series = pd.Series([1]*len(df))

    # Existing types clean
    existing = clean_existing_types(df['Type'])

    # Detect new types strictly
    detected = [detect_types_strict(name, pub) for name, pub in zip(df['Product Name'], published_series)]

    # Combine existing + detected types, remove general if other types exist
    corrected = []
    for ex, det in zip(existing, detected):
        final_set = set(ex + det)
        if 'general' in final_set and len(final_set) > 1:
            final_set.discard('general')
        corrected.append(', '.join(sorted(list(final_set))))

    df['Corrected_Type'] = corrected

    try:
        df.to_csv(output_file, index=False)
        print(f"✅ Done! Saved as '{output_file}'")
    except PermissionError:
        print(f"❌ Permission denied: Close '{output_file}' and try again.")

if __name__ == "__main__":
    main()
    