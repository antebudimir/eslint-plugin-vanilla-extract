import { buttonRecipe } from './recipe.css.js';
import { button, card } from './styles.css.js';

export function Card() {
  return { className: `${card} ${button({ tone: 'brand', size: 'lg' })}` };
}

export function Buttons() {
  return [button, buttonRecipe()].join(' ');
}
