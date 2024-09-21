export function numberToWords(num: number): string {
  if (num === 0) return 'zero';

  const belowTwenty = [
    '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'
  ];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  const thousands = ['', 'thousand', 'million', 'billion'];

  function helper(n: number): string {
    if (n === 0) return '';
    else if (n < 20) return belowTwenty[n] + ' ';
    else if (n < 100) return tens[Math.floor(n / 10)] + ' ' + helper(n % 10);
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

export function toPascalCase(strings: string[]): string {
  if (!Array.isArray(strings)) return '';

  function capitalize(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  return strings.map(capitalize).join('');
}


export function convertNumberToPascalCase(num: number): string {
  return toPascalCase(numberToWords(num).split(' '));
}

/**
 * Injects CSS into the page with a promise when complete.
 */
export function injectCss(href: string): Promise<void> {
  if (document.querySelector(`link[href^='${href}']`)) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('type', 'text/css');
    const timeout = setTimeout(resolve, 1000);
    link.addEventListener('load', (_e) => {
      clearInterval(timeout);
      resolve();
    });
    link.href = href;
    document.head.appendChild(link);
  });
}
