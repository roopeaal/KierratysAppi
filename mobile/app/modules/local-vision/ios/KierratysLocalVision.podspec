require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name = 'KierratysLocalVision'
  s.version = package['version']
  s.summary = package['description']
  s.description = package['description']
  s.license = package['license']
  s.author = package['author']
  s.homepage = package['homepage']
  s.platforms = { :ios => '16.4' }
  s.source = { :git => 'https://github.com/roopeaal/KierratysAppi.git' }
  s.static_framework = true
  s.swift_version = '5.9'
  s.source_files = '*.swift'
  s.resource_bundles = {
    'KierratysLocalVisionPrivacy' => ['PrivacyInfo.xcprivacy'],
    'KierratysLocalVisionModels' => [
      'Resources/mobileclip_s0_image.mlpackage',
      'Resources/mobileclip-prototypes.bin',
      'Resources/mobileclip-source-spec.bin',
      'Resources/mobileclip-source-manifest.bin',
      'Resources/Notices/*.txt'
    ]
  }
  s.frameworks = 'Vision', 'ImageIO', 'CoreGraphics', 'UniformTypeIdentifiers', 'CoreML', 'CoreImage', 'CoreVideo', 'CryptoKit'
  s.dependency 'ExpoModulesCore'
end
