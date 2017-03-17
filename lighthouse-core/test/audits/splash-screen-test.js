/**
 * @license Copyright 2017 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

'use strict';

const SplashScreenAudit = require('../../audits/splash-screen')
const assert = require('assert');
const manifestParser = require('../../lib/manifest-parser');

const manifestSrc = JSON.stringify(require('../fixtures/manifest.json'));
const EXAMPLE_MANIFEST_URL = 'https://example.com/manifest.json';
const EXAMPLE_DOC_URL = 'https://example.com/index.html';
const exampleManifest = manifestParser(manifestSrc, EXAMPLE_MANIFEST_URL, EXAMPLE_DOC_URL);

const GatherRunner = require('../../gather/gather-runner.js');

function generateMockArtifacts() {
  const computedArtifacts = GatherRunner.instantiateComputedArtifacts();
  const mockArtifacts = Object.assign({}, computedArtifacts, {
    Manifest: exampleManifest
  });
  return mockArtifacts;
}

// /* eslint-env mocha */
// describe('PWA: webapp install banner audit', () => {
//   describe.only('basics', () => {
//     it('fails if page had no manifest', () => {
//       const artifacts = generateMockArtifacts();
//       artifacts.Manifest = null;

//       return SplashScreenAudit.audit(artifacts).then(result => {
//         assert.strictEqual(result.rawValue, false);
//         assert.ok(result.debugString.includes('is available'), result.debugString);
//       });
//     });

//     it('fails with a non-parsable manifest', () => {
//       const artifacts = generateMockArtifacts();
//       artifacts.Manifest = manifestParser('{,:}', EXAMPLE_MANIFEST_URL, EXAMPLE_DOC_URL);
//       return SplashScreenAudit.audit(artifacts).then(result => {
//         assert.strictEqual(result.rawValue, false);
//         assert.ok(result.debugString.includes('parsed as JSON'));
//       });
//     });

//     it('fails when an empty manifest is present', () => {
//       const artifacts = generateMockArtifacts();
//       artifacts.Manifest = manifestParser('{}', EXAMPLE_MANIFEST_URL, EXAMPLE_DOC_URL);
//       return SplashScreenAudit.audit(artifacts).then(result => {
//         assert.strictEqual(result.rawValue, false);
//         assert.ok(result.debugString);
//         assert.strictEqual(result.extendedInfo.value.failures.length, 3);
//       });
//     });

//     it('passes with complete manifest and SW', () => {
//       return SplashScreenAudit.audit(generateMockArtifacts()).then(result => {
//         assert.strictEqual(result.rawValue, true, result.debugString);
//         assert.strictEqual(result.debugString, undefined, result.debugString);
//       });
//     });
//   });

//   describe('one-off-failures', () => {
//     /* eslint-disable camelcase */ // because start_url
//     it('fails when a manifest contains no start_url', () => {
//       const artifacts = generateMockArtifacts();
//       artifacts.Manifest.value.start_url.value = undefined;

//       return SplashScreenAudit.audit(artifacts).then(result => {
//         assert.strictEqual(result.rawValue, false);
//         assert.ok(result.debugString.includes('start_url'), result.debugString);
//       });
//     });

//     /* eslint-disable camelcase */ // because short_name
//     it('fails when a manifest contains no short_name', () => {
//       const artifacts = generateMockArtifacts();
//       artifacts.Manifest.value.short_name.value = undefined;

//       return SplashScreenAudit.audit(artifacts).then(result => {
//         assert.strictEqual(result.rawValue, false);
//         assert.ok(result.debugString.includes('short_name'), result.debugString);
//       });
//     });

//     it('fails when a manifest contains no name', () => {
//       const artifacts = generateMockArtifacts();
//       artifacts.Manifest.value.name.value = undefined;

//       return SplashScreenAudit.audit(artifacts).then(result => {
//         assert.strictEqual(result.rawValue, false);
//         assert.ok(result.debugString.includes('name'), result.debugString);
//       });
//     });

//     it('fails if page had no icons in the manifest', () => {
//       const artifacts = generateMockArtifacts();
//       artifacts.Manifest.value.icons.value = [];

//       return SplashScreenAudit.audit(artifacts).then(result => {
//         assert.strictEqual(result.rawValue, false);
//         assert.ok(result.debugString.includes('icons'), result.debugString);
//       });
//     });
//   });

//   it('fails if page had no SW', () => {
//     const artifacts = generateMockArtifacts();
//     artifacts.ServiceWorker.versions = [];

//     return SplashScreenAudit.audit(artifacts).then(result => {
//       assert.strictEqual(result.rawValue, false);
//       assert.ok(result.debugString.includes('Service Worker'), result.debugString);
//     });
//   });
// });