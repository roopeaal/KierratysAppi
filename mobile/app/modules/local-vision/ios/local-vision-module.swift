import ExpoModulesCore

public final class LocalVisionModule: Module {
  public func definition() -> ModuleDefinition {
    Name("KierratysLocalVision")

    AsyncFunction("inspectReadiness") { (promise: Promise) in
      LocalVisionEngine.shared.inspectReadiness { result in
        do {
          promise.resolve(try result.bridgeValue())
        } catch {
          promise.reject("ERR_LOCAL_VISION_FAILED", "failed")
        }
      }
    }

    AsyncFunction("recognize") { (jpegBase64: String, promise: Promise) in
      LocalVisionEngine.shared.recognize(jpegBase64: jpegBase64) { outcome in
        switch outcome {
        case .success(let observation):
          do {
            promise.resolve(try observation.bridgeValue())
          } catch {
            promise.reject("ERR_LOCAL_VISION_FAILED", "failed")
          }
        case .failure(let failure):
          let code = failure.rawValue.uppercased()
          promise.reject("ERR_LOCAL_VISION_\(code)", failure.rawValue)
        }
      }
    }
  }
}
