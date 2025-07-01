import asyncio
import json
from pathlib import Path
from app.services.normalization_service import NormalizationService

async def test_histogram_equalization():
    try:
        # Use an existing image from uploads
        source_path = Path('static/images/uploads/frontend_test.jpg')
        
        if not source_path.exists():
            print('Image not found:', source_path)
            # List available images
            upload_dir = Path('static/images/uploads')
            if upload_dir.exists():
                images = list(upload_dir.glob('*.jpg'))
                if images:
                    source_path = images[0]
                    print('Using:', source_path)
                else:
                    print('No images found in uploads directory')
                    return
        
        print('Testing histogram equalization with:', source_path)
        result = await NormalizationService.normalize_image(source_path, 'histogram_equalization')
        
        print('=== RESULT STRUCTURE ===')
        print('Keys:', list(result.keys()))
        
        if 'result_images' in result:
            print('Number of result images:', len(result['result_images']))
            for img in result['result_images']:
                print('  -', img['name'], ':', img['key'])
        
        if 'chart_data' in result:
            chart_data = result['chart_data']
            print('Chart data keys:', list(chart_data.keys()))
            
            if 'images' in chart_data:
                images = chart_data['images']
                print('Image data keys:', list(images.keys()))
                
                for img_key, img_data in images.items():
                    print('  ' + img_key + ':')
                    print('    histograms:', len(img_data.get('histograms', [])))
                    print('    cdfs:', len(img_data.get('cdfs', [])))
                    if 'scatter_plots' in img_data:
                        print('    scatter_plots:', len(img_data.get('scatter_plots', [])))
        
        print('=== SUCCESS ===')
        return True
        
    except Exception as e:
        print('ERROR:', e)
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_histogram_equalization())
    print('Test', 'PASSED' if success else 'FAILED')
