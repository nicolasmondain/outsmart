#!/usr/bin/env ts-node

/**
 * TypeScript validation script for catalogue data
 * Validates JSON schema, data integrity, and business rules
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import * as Joi from 'joi';
import { performance } from 'perf_hooks';

interface AssetMetadata {
  analyzed_at?: string;
  analysis_type?: string;
  dimensions?: [number, number];
  mode?: string;
  format?: string;
  duration?: number;
  [key: string]: any;
}

interface CatalogueAsset {
  name: string;
  path: string;
  type: 'image' | 'audio' | 'video' | 'unknown';
  size: number;
  created_at: string;
  modified_at: string;
  extension: string;
  metadata: AssetMetadata;
  ai_description?: string;
  ai_generated_at?: string;
}

interface CatalogueMetadata {
  version: string;
  created_at: string;
  last_updated: string;
  asset_count?: number;
}

interface CatalogueData {
  metadata: CatalogueMetadata;
  assets: CatalogueAsset[];
}

class CatalogueValidator {
  private readonly dataDir: string;
  private readonly catalogueFile: string;
  private readonly assetsDir: string;

  // Joi schemas
  private readonly metadataSchema = Joi.object({
    analyzed_at: Joi.string().isoDate().optional(),
    analysis_type: Joi.string().optional(),
    dimensions: Joi.array().items(Joi.number()).length(2).optional(),
    mode: Joi.string().optional(),
    format: Joi.string().optional(),
    duration: Joi.number().positive().optional(),
  }).unknown(true);

  private readonly assetSchema = Joi.object({
    name: Joi.string().required(),
    path: Joi.string().required(),
    type: Joi.string().valid('image', 'audio', 'video', 'unknown').required(),
    size: Joi.number().integer().min(0).required(),
    created_at: Joi.string().isoDate().required(),
    modified_at: Joi.string().isoDate().required(),
    extension: Joi.string().pattern(/^\.[a-zA-Z0-9]+$/).required(),
    metadata: this.metadataSchema.required(),
    ai_description: Joi.string().optional(),
    ai_generated_at: Joi.string().isoDate().optional(),
  });

  private readonly catalogueSchema = Joi.object({
    metadata: Joi.object({
      version: Joi.string().pattern(/^\d+\.\d+\.\d+$/).required(),
      created_at: Joi.string().isoDate().required(),
      last_updated: Joi.string().isoDate().required(),
      asset_count: Joi.number().integer().min(0).optional(),
    }).required(),
    assets: Joi.array().items(this.assetSchema).required(),
  });

  constructor(dataDir?: string) {
    this.dataDir = dataDir || path.join(__dirname, '..');
    this.catalogueFile = path.join(this.dataDir, 'catalogue.json');
    this.assetsDir = path.join(this.dataDir, '..', 'assets');
  }

  /**
   * Validate the entire catalogue
   */
  async validate(): Promise<ValidationResult> {
    const startTime = performance.now();
    const result: ValidationResult = {
      success: true,
      errors: [],
      warnings: [],
      stats: {
        totalAssets: 0,
        validAssets: 0,
        invalidAssets: 0,
        missingFiles: 0,
        orphanedFiles: 0,
      },
      duration: 0,
    };

    try {
      // Check if catalogue file exists
      if (!(await fs.pathExists(this.catalogueFile))) {
        result.success = false;
        result.errors.push('Catalogue file does not exist');
        return result;
      }

      // Load and parse catalogue data
      const catalogueData = await this.loadCatalogueData();
      if (!catalogueData) {
        result.success = false;
        result.errors.push('Failed to load catalogue data');
        return result;
      }

      // Schema validation
      await this.validateSchema(catalogueData, result);

      // Data integrity validation
      await this.validateDataIntegrity(catalogueData, result);

      // File system validation
      await this.validateFileSystem(catalogueData, result);

      // Business rules validation
      await this.validateBusinessRules(catalogueData, result);

      // Calculate final stats
      result.stats.totalAssets = catalogueData.assets.length;
      result.stats.validAssets = result.stats.totalAssets - result.stats.invalidAssets;

      if (result.errors.length > 0) {
        result.success = false;
      }

    } catch (error) {
      result.success = false;
      result.errors.push(`Validation failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      result.duration = performance.now() - startTime;
    }

    return result;
  }

  /**
   * Load catalogue data from JSON file
   */
  private async loadCatalogueData(): Promise<CatalogueData | null> {
    try {
      const data = await fs.readJson(this.catalogueFile);
      return data as CatalogueData;
    } catch (error) {
      console.error('Failed to load catalogue data:', error);
      return null;
    }
  }

  /**
   * Validate JSON schema
   */
  private async validateSchema(data: CatalogueData, result: ValidationResult): Promise<void> {
    try {
      const { error } = this.catalogueSchema.validate(data, {
        abortEarly: false,
        allowUnknown: false
      });

      if (error) {
        result.errors.push(`Schema validation failed: ${error.message}`);
        error.details.forEach(detail => {
          result.errors.push(`  - ${detail.path.join('.')}: ${detail.message}`);
        });
      }
    } catch (error) {
      result.errors.push(`Schema validation error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Validate data integrity
   */
  private async validateDataIntegrity(data: CatalogueData, result: ValidationResult): Promise<void> {
    // Check metadata consistency
    if (data.metadata.asset_count !== undefined && data.metadata.asset_count !== data.assets.length) {
      result.warnings.push(`Asset count mismatch: metadata says ${data.metadata.asset_count}, found ${data.assets.length}`);
    }

    // Check for duplicate assets
    const paths = new Set<string>();
    const names = new Set<string>();

    for (let i = 0; i < data.assets.length; i++) {
      const asset = data.assets[i];

      // Check for duplicate paths
      if (paths.has(asset.path)) {
        result.errors.push(`Duplicate asset path found: ${asset.path}`);
        result.stats.invalidAssets++;
      } else {
        paths.add(asset.path);
      }

      // Check for duplicate names (warning only)
      if (names.has(asset.name)) {
        result.warnings.push(`Duplicate asset name found: ${asset.name}`);
      } else {
        names.add(asset.name);
      }

      // Validate dates
      const createdAt = new Date(asset.created_at);
      const modifiedAt = new Date(asset.modified_at);

      if (isNaN(createdAt.getTime())) {
        result.errors.push(`Invalid created_at date for asset: ${asset.name}`);
        result.stats.invalidAssets++;
      }

      if (isNaN(modifiedAt.getTime())) {
        result.errors.push(`Invalid modified_at date for asset: ${asset.name}`);
        result.stats.invalidAssets++;
      }

      if (createdAt.getTime() > modifiedAt.getTime()) {
        result.warnings.push(`Asset ${asset.name}: created_at is after modified_at`);
      }

      // Validate extension matches type
      const expectedExtensions = this.getExpectedExtensions(asset.type);
      if (!expectedExtensions.includes(asset.extension.toLowerCase())) {
        result.warnings.push(`Asset ${asset.name}: extension ${asset.extension} doesn't match type ${asset.type}`);
      }
    }
  }

  /**
   * Validate against file system
   */
  private async validateFileSystem(data: CatalogueData, result: ValidationResult): Promise<void> {
    if (!(await fs.pathExists(this.assetsDir))) {
      result.warnings.push('Assets directory does not exist');
      return;
    }

    // Check if catalogued files exist
    for (const asset of data.assets) {
      const fullPath = path.join(this.assetsDir, asset.path);

      if (!(await fs.pathExists(fullPath))) {
        result.errors.push(`Missing file: ${asset.path}`);
        result.stats.missingFiles++;
        result.stats.invalidAssets++;
        continue;
      }

      // Verify file stats
      try {
        const stats = await fs.stat(fullPath);

        if (stats.size !== asset.size) {
          result.warnings.push(`File size mismatch for ${asset.path}: expected ${asset.size}, got ${stats.size}`);
        }

        // Check modification time (allow some tolerance for file system differences)
        const fileMtime = stats.mtime.getTime();
        const catalogueMtime = new Date(asset.modified_at).getTime();
        const timeDiff = Math.abs(fileMtime - catalogueMtime);

        if (timeDiff > 2000) { // 2 second tolerance
          result.warnings.push(`File modification time mismatch for ${asset.path}`);
        }

      } catch (error) {
        result.errors.push(`Failed to check file stats for ${asset.path}: ${error instanceof Error ? error.message : String(error)}`);
        result.stats.invalidAssets++;
      }
    }

    // Check for orphaned files (files not in catalogue)
    await this.checkOrphanedFiles(data, result);
  }

  /**
   * Check for files in assets directory not present in catalogue
   */
  private async checkOrphanedFiles(data: CatalogueData, result: ValidationResult): Promise<void> {
    const cataloguePaths = new Set(data.assets.map(asset => asset.path));
    const supportedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.mp3', '.wav', '.flac', '.aac', '.ogg', '.mp4', '.mov', '.avi', '.mkv', '.webm'];

    const findFiles = async (dir: string, relativePath: string = ''): Promise<void> => {
      try {
        const items = await fs.readdir(dir, { withFileTypes: true });

        for (const item of items) {
          const fullPath = path.join(dir, item.name);
          const relPath = path.join(relativePath, item.name);

          if (item.isDirectory()) {
            await findFiles(fullPath, relPath);
          } else if (item.isFile()) {
            const ext = path.extname(item.name).toLowerCase();
            if (supportedExtensions.includes(ext) && !cataloguePaths.has(relPath)) {
              result.warnings.push(`Orphaned file found: ${relPath}`);
              result.stats.orphanedFiles++;
            }
          }
        }
      } catch (error) {
        result.warnings.push(`Failed to scan directory ${dir}: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    await findFiles(this.assetsDir);
  }

  /**
   * Validate business rules
   */
  private async validateBusinessRules(data: CatalogueData, result: ValidationResult): Promise<void> {
    // Check for assets with suspicious sizes
    const maxReasonableSize = 1024 * 1024 * 1024; // 1GB
    const minReasonableSize = 1; // 1 byte

    for (const asset of data.assets) {
      if (asset.size > maxReasonableSize) {
        result.warnings.push(`Asset ${asset.name} has unusually large size: ${asset.size} bytes`);
      }

      if (asset.size < minReasonableSize) {
        result.warnings.push(`Asset ${asset.name} has unusually small size: ${asset.size} bytes`);
      }

      // Check AI description consistency
      if (asset.ai_description && !asset.ai_generated_at) {
        result.warnings.push(`Asset ${asset.name} has AI description but no generation timestamp`);
      }

      if (!asset.ai_description && asset.ai_generated_at) {
        result.warnings.push(`Asset ${asset.name} has AI generation timestamp but no description`);
      }
    }

    // Check catalogue freshness
    const lastUpdated = new Date(data.metadata.last_updated);
    const daysSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceUpdate > 7) {
      result.warnings.push(`Catalogue hasn't been updated in ${Math.floor(daysSinceUpdate)} days`);
    }
  }

  /**
   * Get expected file extensions for asset type
   */
  private getExpectedExtensions(type: string): string[] {
    switch (type) {
      case 'image':
        return ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
      case 'audio':
        return ['.mp3', '.wav', '.flac', '.aac', '.ogg'];
      case 'video':
        return ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
      default:
        return [];
    }
  }

  /**
   * Print validation results
   */
  printResults(result: ValidationResult): void {
    console.log('\n=== Catalogue Validation Results ===\n');

    if (result.success) {
      console.log('✅ Validation PASSED');
    } else {
      console.log('❌ Validation FAILED');
    }

    console.log(`\n📊 Statistics:`);
    console.log(`   Total Assets: ${result.stats.totalAssets}`);
    console.log(`   Valid Assets: ${result.stats.validAssets}`);
    console.log(`   Invalid Assets: ${result.stats.invalidAssets}`);
    console.log(`   Missing Files: ${result.stats.missingFiles}`);
    console.log(`   Orphaned Files: ${result.stats.orphanedFiles}`);
    console.log(`   Duration: ${Math.round(result.duration)}ms`);

    if (result.errors.length > 0) {
      console.log(`\n🚨 Errors (${result.errors.length}):`);
      result.errors.forEach(error => console.log(`   - ${error}`));
    }

    if (result.warnings.length > 0) {
      console.log(`\n⚠️  Warnings (${result.warnings.length}):`);
      result.warnings.forEach(warning => console.log(`   - ${warning}`));
    }

    console.log('\n=== End Results ===\n');
  }
}

interface ValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    totalAssets: number;
    validAssets: number;
    invalidAssets: number;
    missingFiles: number;
    orphanedFiles: number;
  };
  duration: number;
}

// CLI execution
async function main(): Promise<void> {
  const dataDir = process.argv[2];
  const validator = new CatalogueValidator(dataDir);

  console.log('🔍 Starting catalogue validation...\n');

  const result = await validator.validate();
  validator.printResults(result);

  process.exit(result.success ? 0 : 1);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Validation failed with error:', error);
    process.exit(1);
  });
}

export { CatalogueValidator, ValidationResult };
