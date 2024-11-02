export function numberToWords(num) {
    if (num === 0)
        return 'zero';
    const belowTwenty = [
        '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
        'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'
    ];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    const thousands = ['', 'thousand', 'million', 'billion'];
    function helper(n) {
        if (n === 0)
            return '';
        else if (n < 20)
            return belowTwenty[n] + ' ';
        else if (n < 100)
            return tens[Math.floor(n / 10)] + ' ' + helper(n % 10);
        return belowTwenty[Math.floor(n / 100)] + ' hundred ' + helper(n % 100);
    }
    let word = '';
    let i = 0;
    while (num > 0) {
        if (num % 1000 !== 0) {
            word = helper(num % 1000) + thousands[i] + ' ' + word;
        }
        num = Math.floor(num / 1000);
        i++;
    }
    return word.trim();
}
export function toPascalCase(strings) {
    if (!Array.isArray(strings))
        return '';
    function capitalize(word) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
    return strings.map(capitalize).join('');
}
export function convertNumberToPascalCase(num) {
    return toPascalCase(numberToWords(num).split(' '));
}
export function formatBytes(bytes) {
    if (bytes === 0)
        return '0 Bytes';
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const formattedSize = (bytes / Math.pow(1024, i)).toFixed(2);
    return `${formattedSize} ${sizes[i]}`;
}
export function createStyleSheet(id) {
    const style = document.createElement('style');
    style.setAttribute('id', id);
    style.setAttribute('rel', 'stylesheet');
    style.setAttribute('type', 'text/css');
    document.head.appendChild(style);
    return style;
}
