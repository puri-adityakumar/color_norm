import asyncio
import sys
from pathlib import Path
from app.services.normalization_service import NormalizationService

async def test_api_flow():
    """Test the complete API flow that the frontend would use"""
    print("Testing Histogram Equalization...")
    
    # List available images
    upload_dir = Path('static/images/uploads')
    images = list(upload_dir.glob('*.jpg'))
    
    if not images:
        print("No test images found!")
        return False
        
    source_path = images[0]
    print(f"Using test image: {source_path}")
    
    try:
        # Test histogram equalization
        result = await NormalizationService.normalize_image(source_path, 'histogram_equalization')
        
        print("✅ Backend processing successful!")
        print(f"   Result images: {len(result.get('result_images', []))}")
        print(f"   Chart data available: {'chart_data' in result}")
        
        # Test the structure that frontend expects
        if 'result_images' in result:
            for img in result['result_images']:
                print(f"   - {img['name']}: {img['path']}")
        
        # Check chart data structure
        if 'chart_data' in result:
            chart_data = result['chart_data']['images']
            print(f"   Chart data keys: {list(chart_data.keys())}")
            for key in chart_data.keys():
                histograms = len(chart_data[key].get('histograms', []))
                cdfs = len(chart_data[key].get('cdfs', []))
                scatter_plots = len(chart_data[key].get('scatter_plots', []))
                print(f"     {key}: {histograms} hist, {cdfs} cdf, {scatter_plots} scatter")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_api_flow())
    print(f"\nTest Result: {'PASSED' if success else 'FAILED'}")
