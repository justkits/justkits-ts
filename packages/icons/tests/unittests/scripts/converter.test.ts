import { unlink } from "node:fs/promises";
import { atomicWrite } from "@justkits/svgs-core";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { iconConverter } from "@scripts/core/converter";
import { databaseManager, IconMetadata } from "@scripts/lib/database";

vi.mock("node:fs/promises", () => {
  const unlinkFn = vi.fn();
  return {
    default: { unlink: unlinkFn },
    unlink: unlinkFn,
  };
});

vi.mock("@scripts/lib/database", () => ({
  databaseManager: {
    upsert: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("IconConverter", () => {
  const unlinkMock = unlink as unknown as ReturnType<typeof vi.fn>;
  const atomicWriteMock = atomicWrite as unknown as ReturnType<typeof vi.fn>;
  const databaseUpsertMock = databaseManager.upsert as unknown as ReturnType<
    typeof vi.fn
  >;
  const databaseDeleteMock = databaseManager.delete as unknown as ReturnType<
    typeof vi.fn
  >;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("convertOne (via runConvert)", () => {
    it("should convert icon and save web and native files", async () => {
      const metadata: IconMetadata = {
        family: "app",
        path: "app/settings.svg",
        hash: "hash1",
        iconName: "settings",
        componentName: "Settings",
      };

      // Spy on svg2tsx if needed, but it's already mocked in BaseConverter to return a string
      // We can verify atomicWrite calls.

      await iconConverter.runConvert([metadata]);

      // Expect atomicWrite to be called twice (web and native)
      expect(atomicWriteMock).toHaveBeenCalledTimes(2);

      // Check Web file write
      expect(atomicWriteMock).toHaveBeenCalledWith(
        expect.stringContaining("/web/app/components/Settings.tsx"),
        expect.stringContaining("export function Settings"),
      );
      expect(atomicWriteMock).toHaveBeenCalledWith(
        expect.stringContaining("/web/app/components/Settings.tsx"),
        expect.stringContaining(
          'import type { IconProps } from "@icons/types";',
        ),
      );

      // Check Native file write
      expect(atomicWriteMock).toHaveBeenCalledWith(
        expect.stringContaining("/native/app/components/Settings.tsx"),
        expect.stringContaining("export function Settings"),
      );
      expect(atomicWriteMock).toHaveBeenCalledWith(
        expect.stringContaining("/native/app/components/Settings.tsx"),
        expect.stringContaining(
          'import type { IconProps } from "@icons/types";',
        ),
      );

      // Expect database update
      expect(databaseUpsertMock).toHaveBeenCalledWith(metadata);
    });

    it("should handle multiple icons", async () => {
      const meta1: IconMetadata = {
        family: "app",
        path: "app/icon1.svg",
        hash: "h1",
        iconName: "icon1",
        componentName: "Icon1",
      };
      const meta2: IconMetadata = {
        family: "media",
        path: "media/icon2.svg",
        hash: "h2",
        iconName: "icon2",
        componentName: "Icon2",
      };

      await iconConverter.runConvert([meta1, meta2]);

      expect(atomicWriteMock).toHaveBeenCalledTimes(4); // 2 per icon
      expect(databaseUpsertMock).toHaveBeenCalledTimes(2);
    });
  });

  describe("deleteOne (via runDelete)", () => {
    it("should delete web and native files and update database", async () => {
      const metadata: IconMetadata = {
        family: "app",
        path: "app/settings.svg",
        hash: "hash1",
        iconName: "settings",
        componentName: "Settings",
      };

      await iconConverter.runDelete([metadata]);

      // Expect unlink to be called twice
      expect(unlinkMock).toHaveBeenCalledTimes(2);
      expect(unlinkMock).toHaveBeenCalledWith(
        expect.stringContaining("/web/app/components/Settings.tsx"),
      );
      expect(unlinkMock).toHaveBeenCalledWith(
        expect.stringContaining("/native/app/components/Settings.tsx"),
      );

      // Expect database delete
      expect(databaseDeleteMock).toHaveBeenCalledWith("settings");
    });
  });
});
