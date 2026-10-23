import assert from "node:assert/strict";
import { test } from "node:test";
import { canonicalDocPath, resolveDocRedirect } from "./redirects.ts";

test("moved pages preserve locale, query and device integration anchors", () => {
  assert.equal(
    resolveDocRedirect(
      new URL(
        "https://docs.example/docs/es/platform/pki/est-enrollment?client=firmware#integración-de-dispositivos",
      ),
      "/docs",
    ),
    "/docs/es/platform/iot-fleets/enrollment/est-client?client=firmware#solicita-la-identidad",
  );
  assert.equal(
    resolveDocRedirect(
      new URL(
        "https://docs.example/docs/platform/pki/device-enrollment/?tab=est#configure-a-dms",
      ),
      "/docs",
    ),
    "/docs/platform/iot-fleets/enrollment/dms?tab=est#configure-a-dms",
  );
});

test("old manual URLs resolve directly to the current page", () => {
  assert.equal(
    canonicalDocPath("manual/servicios-core/est"),
    "platform/iot-fleets/enrollment/overview",
  );
  assert.equal(
    resolveDocRedirect(
      new URL("https://docs.example/docs/es/manual/integraciones/aws"),
      "/docs",
    ),
    "/docs/es/platform/iot-fleets/integrations/aws-iot-core",
  );
});

test("extracted troubleshooting sections keep their destination and locale", () => {
  assert.equal(
    resolveDocRedirect(
      new URL(
        "https://docs.example/docs/platform/pki/troubleshooting?incident=42#i-cannot-sign-in",
      ),
      "/docs",
    ),
    "/docs/deployment/troubleshooting?incident=42#i-cannot-sign-in",
  );
  assert.equal(
    resolveDocRedirect(
      new URL(
        "https://docs.example/docs/es/platform/pki/troubleshooting#un-pod-no-est%C3%A1-ready",
      ),
      "/docs",
    ),
    "/docs/es/deployment/troubleshooting#un-pod-no-está-ready",
  );
  assert.equal(
    resolveDocRedirect(
      new URL(
        "https://docs.example/docs/platform/pki/troubleshooting#est-enrollment-fails",
      ),
      "/docs",
    ),
    "/docs/platform/iot-fleets/enrollment/troubleshooting#est-enrollment-fails",
  );
});

test("release and preview mounts remain in their own version", () => {
  for (const base of ["/docs/v3.8.0", "/docs/pr-preview/pr-42"]) {
    assert.equal(
      resolveDocRedirect(
        new URL(
          `https://docs.example${base}/es/platform/pki/device-management#device-states`,
        ),
        `${base}/`,
      ),
      `${base}/es/platform/iot-fleets/device-management#device-states`,
    );
  }
});

test("canonical pages, removed fixtures and unrelated mounts do not redirect", () => {
  for (const path of [
    "/docs/platform/iot-fleets/enrollment/overview",
    "/docs/platform/pki/troubleshooting#issuance-fails",
    "/docs/test",
    "/documentation/platform/pki/est-enrollment",
    "/docs/toString",
  ]) {
    assert.equal(
      resolveDocRedirect(new URL(`https://docs.example${path}`), "/docs"),
      undefined,
    );
  }
  assert.equal(canonicalDocPath("toString"), "toString");
});

test("malformed fragments are carried through without crashing", () => {
  assert.equal(
    resolveDocRedirect(
      new URL("https://docs.example/docs/platform/pki/est-enrollment#%E0%A4%A"),
      "/docs",
    ),
    "/docs/platform/iot-fleets/enrollment/overview#%E0%A4%A",
  );
});

test("split EST sections resolve from canonical and legacy paths at versioned mounts", () => {
  for (const base of ["/docs", "/docs/v3.8.0", "/docs/pr-preview/pr-42"]) {
    for (const path of [
      "platform/iot-fleets/enrollment/overview",
      "platform/pki/est-enrollment",
      "manual/servicios-core/est",
    ]) {
      assert.equal(
        resolveDocRedirect(
          new URL(
            `https://docs.example${base}/${path}?client=firmware#serverkeygen`,
          ),
          base,
        ),
        `${base}/platform/iot-fleets/enrollment/est-reference?client=firmware#serverkeygen`,
      );
      assert.equal(
        resolveDocRedirect(
          new URL(
            `https://docs.example${base}/es/${path}?client=firmware#ejemplo-end-to-end-reenroll`,
          ),
          base,
        ),
        `${base}/es/platform/iot-fleets/enrollment/renewal-and-recovery?client=firmware#solicita-el-certificado-sucesor`,
      );
    }
  }
});
