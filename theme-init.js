/**
 * theme-init - 最初の描画の前にテーマを決める。<head> で同期読み込みする。
 *
 * style.css の既定はライトで、ダークは [data-theme="dark"] で切り替える。
 * 保存した選択の適用を defer の script.js で行うと、ライトで描いたあとに
 * 保存したダークへ切り替わって見える。
 *
 * 保存した選択（localStorage の theme）が light・dark ならそれを使い、
 * それ以外（未保存・想定外の値）はライトにする（OS の設定には従わない）。
 * localStorage が読めない環境でも落ちないよう try/catch で囲む。
 * <head> の時点では body が無いため、属性は <html> に付ける。
 */
(function (global) {
  'use strict';

  var theme = 'light';
  try {
    var saved = global.localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') theme = saved;
  } catch (e) {
    // 使えない環境でもライトで続行
  }

  global.document.documentElement.setAttribute('data-theme', theme);
})(typeof window !== 'undefined' ? window : globalThis);
