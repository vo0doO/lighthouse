/**
 * Copyright 2017 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

/* eslint-env mocha, browser */

const assert = require('assert');
const fs = require('fs');
const jsdom = require('jsdom');
const sampleResults = require('../../results/sample_v2.json');
const TEMPLATES_FILE = fs.readFileSync(__dirname + '/../../../report/v2/templates.html', 'utf8');

function setupJsDomGlobals() {
  global.document = jsdom.jsdom(TEMPLATES_FILE);
  global.window = global.document.defaultView;
  global.self = global.window;
}

function cleanupJsDomGlobals() {
  global.document = undefined;
  global.window = undefined;
  global.self = undefined;
}

setupJsDomGlobals(); // Run jsdom setup code before report renderer is executed.
require('../../../report/v2/report-renderer.js');

describe('DOM', () => {
  const window = self;
  const DOM = window.DOM;

  before(setupJsDomGlobals);
  after(cleanupJsDomGlobals);

  describe('setText', () => {
    it('sets text of element', () => {
      const el = document.createElement('div');
      const result = DOM.setText(el, 'hello world');
      assert.deepStrictEqual(result, el);
      assert.equal(result.textContent, 'hello world');
    });

    it('does not fail when given null element argument', () => {
      assert.doesNotThrow(() => {
        const result = DOM.setText(null, 'hello world');
        assert.strictEqual(result, null);
      });
    });
  });

  describe('addClass', () => {
    it('adds classes to element', () => {
      const el = document.createElement('div');
      const result = DOM.addClass(el, 'class1', 'class2');
      assert.ok(result.classList.contains, 'class1');
      assert.ok(result.classList.contains, 'class2');
    });

    it('does not fail when given null element argument', () => {
      assert.doesNotThrow(() => {
        const result = DOM.addClass(null, 'class1');
        assert.strictEqual(result, null);
      });
    });
  });

  describe('createElement', () => {
    it('creates a simple element using default values', () => {
      const dom = new DOM(document);
      const el = dom.createElement('div');
      assert.equal(el.localName, 'div');
      assert.equal(el.className, '');
      assert.equal(el.className, el.attributes.length);
    });

    it('creates an element from parameters', () => {
      const dom = new DOM(document);
      const el = dom.createElement('div', 'class1 class2', {title: 'title attr', tabindex: 0});
      assert.equal(el.localName, 'div');
      assert.equal(el.className, 'class1 class2');
      assert.equal(el.getAttribute('title'), 'title attr');
      assert.equal(el.getAttribute('tabindex'), '0');
    });
  });

  describe('cloneTemplate', () => {
    it('should clone a template', () => {
      const dom = new DOM(document);
      const clone = dom.cloneTemplate('#tmpl-lighthouse-audit-score');
      assert.ok(clone.querySelector('.lighthouse-score'));
    });

    it('fails when template cannot be found', () => {
      const dom = new DOM(document);
      assert.throws(() => {
        dom.cloneTemplate('#unknown-selector');
      });
    });
  });
});

describe('ReportRenderer V2', () => {
  const window = self;

  before(setupJsDomGlobals);
  after(cleanupJsDomGlobals);

  describe('renderReport', () => {
    const ReportRenderer = window.ReportRenderer;

    it('should render a report', () => {
      const renderer = new ReportRenderer(document);
      const output = renderer.renderReport(sampleResults);
      assert.ok(output.classList.contains('lighthouse-report'));
    });

    it('should render an exception for invalid input', () => {
      const renderer = new ReportRenderer(document);
      const output = renderer.renderReport({
        get reportCategories() {
          throw new Error();
        }
      });
      assert.ok(output.classList.contains('lighthouse-exception'));
    });

    it('renders an audit', () => {
      const renderer = new ReportRenderer(document);
      const audit = sampleResults.reportCategories[0].audits[0];
      const auditDOM = renderer._renderAudit(audit);

      const title = auditDOM.querySelector('.lighthouse-score__title');
      const description = auditDOM.querySelector('.lighthouse-score__description');
      const score = auditDOM.querySelector('.lighthouse-score__value');

      assert.equal(title.textContent, audit.result.description);
      assert.equal(description.textContent, audit.result.helpText);
      assert.equal(score.textContent, '0');
      assert.ok(score.classList.contains('lighthouse-score__value--fail'));
      assert.ok(score.classList.contains(`lighthouse-score__value--${audit.result.scoringMode}`));
    });

    it('renders a category', () => {
      const renderer = new ReportRenderer(document);
      const category = sampleResults.reportCategories[0];
      const categoryDOM = renderer._renderCategory(category);

      const score = categoryDOM.querySelector('.lighthouse-score');
      const value = categoryDOM.querySelector('.lighthouse-score  > .lighthouse-score__value');
      const title = score.querySelector('.lighthouse-score__title');
      const description = score.querySelector('.lighthouse-score__description');

      assert.deepEqual(score, score.firstElementChild, 'first child is a score');
      assert.ok(value.classList.contains('lighthouse-score__value--numeric'),
                'category score is numeric');
      assert.equal(value.textContent, Math.round(category.score), 'category score is rounded');
      assert.equal(title.textContent, category.name, 'title is set');
      assert.equal(description.textContent, category.description, 'description is set');

      const audits = categoryDOM.querySelectorAll('.lighthouse-category > .lighthouse-audit');
      assert.equal(audits.length, category.audits.length, 'renders correct number of audits');
    });
  });
});
