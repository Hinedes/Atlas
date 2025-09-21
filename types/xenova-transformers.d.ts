declare module '@xenova/transformers' {
  export type PipelineType = 'feature-extraction';

  export interface FeatureExtractionPipeline {
    (text: string | string[], options: { pooling: 'mean', normalize: true }): Promise<any>;
  }

  export function pipeline(task: PipelineType, model: string): Promise<FeatureExtractionPipeline>;
}
