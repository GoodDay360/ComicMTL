export function ensure_safe_table_name(item: string): string {
    // Define the pattern for allowed characters (alphanumeric, underscore, and Unicode characters)
    const pattern = /[^\p{L}\p{N}_-]/gu;
    
    // Replace illegal characters with an underscore
    const safe_table_name = item.replace(pattern, '_');
    
    return safe_table_name;
}