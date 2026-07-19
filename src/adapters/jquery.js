import Kineto from '@dong-gri/kineto';

export function installKineto($) {
  if (!$?.fn) throw new TypeError('A jQuery-compatible instance is required.');

  $.fn.kineto = function kineto(type, options = {}) {
    this.each((_index, element) => Kineto.create(type, element, options));
    return this;
  };

  $.fn.destroyKineto = function destroyKineto(type) {
    this.each((_index, element) => {
      if (type) Kineto.destroyModule(element, type);
      else Kineto.destroy(element);
    });
    return this;
  };

  return $;
}

if (typeof window !== 'undefined' && window.jQuery) installKineto(window.jQuery);

export { Kineto };
export default installKineto;
