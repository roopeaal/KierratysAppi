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
    'KierratysLocalVisionPrivacy' => ['PrivacyInfo.xcprivacy']
  }
  s.frameworks = 'Vision', 'ImageIO', 'CoreGraphics', 'UniformTypeIdentifiers'
  s.dependency 'ExpoModulesCore'
end
