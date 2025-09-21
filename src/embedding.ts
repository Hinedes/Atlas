import { pipeline, FeatureExtractionPipeline, PipelineType } from '@xenova/transformers';

// Helper class for the embedding model
export class EmbeddingPipeline {
    static task: PipelineType = 'feature-extraction';
    static model = 'Xenova/all-MiniLM-L6-v2';
    static instance: FeatureExtractionPipeline | null = null;

    static async getInstance() {
        if (this.instance === null) {
            this.instance = await pipeline(this.task, this.model) as FeatureExtractionPipeline;
        }
        return this.instance;
    }
}
