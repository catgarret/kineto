import MotionKit from '@dong-gri/motionkit';

export function installMotionKit($) {
  if (!$?.fn) throw new TypeError('A jQuery-compatible instance is required.');

  $.fn.motionKit = function motionKit(type, options = {}) {
    this.each((_index, element) => MotionKit.create(type, element, options));
    return this;
  };

  $.fn.destroyMotionKit = function destroyMotionKit(type) {
    this.each((_index, element) => {
      if (type) MotionKit.destroyModule(element, type);
      else MotionKit.destroy(element);
    });
    return this;
  };

  return $;
}

if (typeof window !== 'undefined' && window.jQuery) installMotionKit(window.jQuery);

export { MotionKit };
export default installMotionKit;
