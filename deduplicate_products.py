#!/usr/bin/env python3
"""
Deduplicate products by name and consolidate their conditions.
Each product name will appear only once with all available conditions.
"""

import json
from collections import defaultdict

def deduplicate_products(input_file='products.json', output_file='products.json'):
    """Deduplicate products and consolidate conditions."""
    
    # Load products
    print(f"Loading products from {input_file}...")
    with open(input_file, 'r', encoding='utf-8') as f:
        products = json.load(f)
    
    print(f"Total products before deduplication: {len(products)}")
    
    # Group products by name
    products_by_name = defaultdict(list)
    for product in products:
        name = product.get('name', '').strip()
        if name:
            products_by_name[name].append(product)
    
    # Deduplicate: keep one product per name with all conditions
    deduplicated = []
    duplicates_removed = 0
    
    for name, product_list in products_by_name.items():
        if len(product_list) == 1:
            # No duplicates, keep as is
            product = product_list[0]
            # Ensure available_conditions exists
            if 'available_conditions' not in product:
                product['available_conditions'] = []
            if product.get('condition'):
                if product['condition'] not in product['available_conditions']:
                    product['available_conditions'].append(product['condition'])
            deduplicated.append(product)
        else:
            # Multiple products with same name - consolidate
            duplicates_removed += len(product_list) - 1
            
            # Choose the best product as base (prefer one with image, then most availability)
            base_product = max(product_list, key=lambda p: (
                1 if p.get('images') and len(p.get('images', [])) > 0 else 0,
                int(p.get('availability', '0').replace('i lager', '1').replace('ej', '0') or '0')
            ))
            
            # Collect all conditions with their prices and availability
            conditions_data = {}
            for p in product_list:
                condition = p.get('condition', '')
                if condition:
                    if condition not in conditions_data:
                        conditions_data[condition] = {
                            'price': p.get('price', '0'),
                            'availability': p.get('availability', '0'),
                            'url': p.get('url', '')
                        }
                    else:
                        # Keep the one with better availability
                        current_avail = conditions_data[condition]['availability']
                        new_avail = p.get('availability', '0')
                        try:
                            current_num = int(str(current_avail).replace('i lager', '1').replace('ej', '0') or '0')
                            new_num = int(str(new_avail).replace('i lager', '1').replace('ej', '0') or '0')
                            if new_num > current_num:
                                conditions_data[condition] = {
                                    'price': p.get('price', '0'),
                                    'availability': new_avail,
                                    'url': p.get('url', '')
                                }
                        except:
                            pass
            
            # Create available_conditions array with condition objects
            available_conditions = []
            for condition, data in conditions_data.items():
                available_conditions.append({
                    'condition': condition,
                    'price': data['price'],
                    'availability': data['availability'],
                    'url': data['url']
                })
            
            # Update base product
            base_product['available_conditions'] = available_conditions
            
            # Set default condition to the first available (or best one)
            if available_conditions:
                # Sort by availability (best first)
                sorted_conditions = sorted(
                    available_conditions,
                    key=lambda x: int(str(x.get('availability', '0')).replace('i lager', '1').replace('ej', '0') or '0'),
                    reverse=True
                )
                base_product['condition'] = sorted_conditions[0]['condition']
                base_product['price'] = sorted_conditions[0]['price']
                base_product['availability'] = sorted_conditions[0]['availability']
            
            deduplicated.append(base_product)
    
    print(f"\nDeduplication complete:")
    print(f"  Products after deduplication: {len(deduplicated)}")
    print(f"  Duplicates removed: {duplicates_removed}")
    print(f"  Reduction: {len(products) - len(deduplicated)} products")
    
    # Save deduplicated products
    print(f"\nSaving to {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(deduplicated, f, ensure_ascii=False, indent=2)
    
    print(f"✓ Saved {len(deduplicated)} unique products to {output_file}")
    
    # Show some examples
    print("\nExample products with multiple conditions:")
    examples = [p for p in deduplicated if p.get('available_conditions') and len(p['available_conditions']) > 1][:5]
    for p in examples:
        print(f"  {p['name']}: {len(p['available_conditions'])} conditions")
        for cond in p['available_conditions']:
            print(f"    - {cond['condition']}: {cond['price']} (Availability: {cond['availability']})")

if __name__ == '__main__':
    deduplicate_products()
