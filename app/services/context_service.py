import uuid
from datetime import datetime
from app.models.request import AnalyzeRequest
from app.models.context import RequestContext

def create_context(request: AnalyzeRequest) -> RequestContext:
    """
    Creates a RequestContext object from an AnalyzeRequest.
    """
    request_id = str(uuid.uuid4())
    timestamp = datetime.now()
    
    return RequestContext(
        request_id=request_id,
        user_id=request.user_id,
        prompt=request.prompt,
        timestamp=timestamp,
    )
