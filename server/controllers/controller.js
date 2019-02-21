"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FhirHelper = require("../fhirHelper");
const log4js = require("log4js");
class BaseController {
    static handleResponse(res, actual) {
        if (actual.contentType) {
            res.contentType(actual.contentType);
        }
        if (actual.contentDisposition) {
            res.setHeader('Content-Disposition', actual.contentDisposition);
        }
        res.status(actual.status || 200).send(actual.content);
    }
    static handleError(err, body, res, defaultMessage = 'An unknown error occurred') {
        const msg = FhirHelper.getErrorString(err, body, defaultMessage);
        this.log.error(msg);
        if (res) {
            if (err && err.statusCode) {
                res.status(err.statusCode);
            }
            else {
                res.status(500);
            }
            res.send(msg);
        }
    }
}
BaseController.log = log4js.getLogger();
exports.BaseController = BaseController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw0Q0FBNEM7QUFDNUMsaUNBQWlDO0FBVWpDO0lBR2MsTUFBTSxDQUFDLGNBQWMsQ0FBQyxHQUFhLEVBQUUsTUFBdUI7UUFDbEUsSUFBSSxNQUFNLENBQUMsV0FBVyxFQUFFO1lBQ3BCLEdBQUcsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1NBQ3ZDO1FBRUQsSUFBSSxNQUFNLENBQUMsa0JBQWtCLEVBQUU7WUFDM0IsR0FBRyxDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsRUFBRSxNQUFNLENBQUMsa0JBQWtCLENBQUMsQ0FBQztTQUNuRTtRQUVELEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFFUyxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxJQUFLLEVBQUUsR0FBSSxFQUFFLGNBQWMsR0FBRywyQkFBMkI7UUFDdkYsTUFBTSxHQUFHLEdBQUcsVUFBVSxDQUFDLGNBQWMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBRWpFLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRXBCLElBQUksR0FBRyxFQUFFO1lBQ0wsSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLFVBQVUsRUFBRTtnQkFDdkIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDOUI7aUJBQU07Z0JBQ0gsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUNuQjtZQUVELEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDakI7SUFDTCxDQUFDOztBQTVCZ0Isa0JBQUcsR0FBRyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7QUFEOUMsd0NBOEJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgRmhpckhlbHBlciBmcm9tICcuLi9maGlySGVscGVyJztcclxuaW1wb3J0ICogYXMgbG9nNGpzIGZyb20gJ2xvZzRqcyc7XHJcbmltcG9ydCB7UmVzcG9uc2V9IGZyb20gJ2V4cHJlc3MnO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBHZW5lcmljUmVzcG9uc2Uge1xyXG4gICAgc3RhdHVzPzogbnVtYmVyO1xyXG4gICAgY29udGVudFR5cGU/OiBzdHJpbmc7XHJcbiAgICBjb250ZW50RGlzcG9zaXRpb24/OiBzdHJpbmc7XHJcbiAgICBjb250ZW50OiBhbnk7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBCYXNlQ29udHJvbGxlciB7XHJcbiAgICBwcm90ZWN0ZWQgc3RhdGljIGxvZyA9IGxvZzRqcy5nZXRMb2dnZXIoKTtcclxuXHJcbiAgICBwcm90ZWN0ZWQgc3RhdGljIGhhbmRsZVJlc3BvbnNlKHJlczogUmVzcG9uc2UsIGFjdHVhbDogR2VuZXJpY1Jlc3BvbnNlKSB7XHJcbiAgICAgICAgaWYgKGFjdHVhbC5jb250ZW50VHlwZSkge1xyXG4gICAgICAgICAgICByZXMuY29udGVudFR5cGUoYWN0dWFsLmNvbnRlbnRUeXBlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChhY3R1YWwuY29udGVudERpc3Bvc2l0aW9uKSB7XHJcbiAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtRGlzcG9zaXRpb24nLCBhY3R1YWwuY29udGVudERpc3Bvc2l0aW9uKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJlcy5zdGF0dXMoYWN0dWFsLnN0YXR1cyB8fCAyMDApLnNlbmQoYWN0dWFsLmNvbnRlbnQpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBzdGF0aWMgaGFuZGxlRXJyb3IoZXJyLCBib2R5PywgcmVzPywgZGVmYXVsdE1lc3NhZ2UgPSAnQW4gdW5rbm93biBlcnJvciBvY2N1cnJlZCcpIHtcclxuICAgICAgICBjb25zdCBtc2cgPSBGaGlySGVscGVyLmdldEVycm9yU3RyaW5nKGVyciwgYm9keSwgZGVmYXVsdE1lc3NhZ2UpO1xyXG5cclxuICAgICAgICB0aGlzLmxvZy5lcnJvcihtc2cpO1xyXG5cclxuICAgICAgICBpZiAocmVzKSB7XHJcbiAgICAgICAgICAgIGlmIChlcnIgJiYgZXJyLnN0YXR1c0NvZGUpIHtcclxuICAgICAgICAgICAgICAgIHJlcy5zdGF0dXMoZXJyLnN0YXR1c0NvZGUpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmVzLnN0YXR1cyg1MDApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXMuc2VuZChtc2cpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSJdfQ==