def tax_rate(country):
    if country == 'RU':
        return 0.22
    return 0.10







def calculate_total(items):
    total = 0
    for item in items:
        total += item['price'] * item.get('quantity', 1)
    return total







def normalize_email(email):
    return email.strip().lower()
